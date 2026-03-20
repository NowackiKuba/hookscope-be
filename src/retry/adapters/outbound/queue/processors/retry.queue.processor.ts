import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { RETRY_DELAY_MAP, Token } from '@retry/constants';
import { Token as RequestToken } from '@request/constants';
import { RetryStatus } from '@retry/domain/enums/retry-status.enum';
import { RetryRepositoryPort } from '@retry/domain/ports/repositories/retry.repository.port';
import { HttpService, LoggerProvider } from '@shared/constants';
import { withForkedContext } from '@shared/utils/request-context';
import { Job } from 'bullmq';
import { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { HttpServicePort } from '@shared/domain/ports/outbound/http.service.port';
import { addMilliseconds } from 'date-fns';
import { RetryQueuePort } from '@retry/domain/ports/outbound/queue/retry.queue.port';
import type { Logger } from 'winston';
import { EventBus } from '@nestjs/cqrs';
import { AlertDetectedEvent } from '@webhook/domain/events/alert-detected.event';
import { AlertMetadata } from '@webhook/domain/value-objects/alert-metadata.vo';

function safeErrorMeta(error: unknown): {
  name?: string;
  message: string;
  code?: unknown;
  detail?: unknown;
  stack?: string;
} {
  if (error instanceof Error) {
    const anyErr = error as any;
    const message =
      typeof error.message === 'string'
        ? error.message.split('\n')[0] // avoid logging giant SQL / HTML blobs
        : String(error);
    return {
      name: typeof anyErr?.name === 'string' ? anyErr.name : error.name,
      message,
      code: anyErr?.code,
      detail: anyErr?.detail ?? anyErr?.cause?.detail,
      stack: error.stack,
    };
  }
  return { message: String(error) };
}

@Processor('retry')
export class RetryQueueProcessor extends WorkerHost {
  constructor(
    @Inject(LoggerProvider)
    private readonly logger: Logger,
    private readonly orm: MikroORM,
    @Inject(HttpService)
    private readonly httpService: HttpServicePort,
    @Inject(Token.RetryRepository)
    private readonly retryRepository: RetryRepositoryPort,
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(Token.RetryQueue) private readonly queue: RetryQueuePort,
    private readonly eventBus: EventBus,
  ) {
    super();
  }

  async process(
    job: Job<{ retryId: string }, any, string>,
    token?: string,
  ): Promise<any> {
    try {
      await withForkedContext(this.orm, async () => {
        let terminalError: Error | null = null;

        this.logger.info('RETRY JOB START', {
          jobId: job.id,
          jobName: job.name,
          retryId: job.data?.retryId,
          data: job.data,
          token,
        });

        const retryId = job.data?.retryId;
        if (!retryId) {
          this.logger.warn('RETRY JOB MISSING RETRY ID', {
            jobId: job.id,
            jobName: job.name,
            data: job.data,
            token,
          });
          return;
        }

        const retry = await this.retryRepository.findById(retryId);

        if (!retry) {
          this.logger.warn('RETRY NOT FOUND', { retryId });
          return;
        }

        const request = await this.requestRepository.findById(retry.requestId);

        if (!request) {
          this.logger.warn('REQUEST NOT FOUND FOR RETRY', {
            retryId: retry.id,
            requestId: retry.requestId,
          });
          return;
        }

        if (retry.status !== RetryStatus.PENDING) {
          this.logger.info('SKIP RETRY (NOT PENDING)', {
            retryId: retry.id,
            requestId: retry.requestId,
            status: retry.status,
            attemptCount: retry.attemptCount,
          });
          return;
        }

        this.logger.info('RETRY SENDING REQUEST', {
          retryId: retry.id,
          requestId: retry.requestId,
          attemptCount: retry.attemptCount,
          targetUrl: retry.targetUrl,
        });

        const overrides =
          retry.customBody !== undefined || retry.customHeaders !== undefined
            ? {
                body: retry.customBody,
                headers: retry.customHeaders,
              }
            : undefined;
        const response = await this.httpService.send(
          request,
          retry.targetUrl,
          overrides,
        );

        this.logger.info('RETRY RESPONSE RECEIVED', {
          retryId: retry.id,
          requestId: retry.requestId,
          attemptCount: retry.attemptCount,
          status: response.status,
        });

        if (response.status >= 500) {
          const nextAttemptCount = retry.attemptCount + 1;
          const nextDelayMs = RETRY_DELAY_MAP.get(nextAttemptCount);

          retry.onFail({
            body: response.body,
            next: addMilliseconds(new Date(), nextDelayMs),
            status: response.status,
          });

          if (nextDelayMs) {
            await this.queue.scheduleRetry(retry.id, nextDelayMs);
            this.logger.info('RETRY RESCHEDULED', {
              retryId: retry.id,
              requestId: retry.requestId,
              attemptCount: retry.attemptCount,
              nextDelayMs,
            });
          } else {
            await this.eventBus.publish(
              new AlertDetectedEvent({
                endpointId: request.endpointId,
                metadata: AlertMetadata.endpointError({
                  requestId: retry.requestId,
                  responseBody: retry.responseBody,
                  statusCode: retry.responseStatus,
                }).value,
                type: 'endpoint_error',
                userId: '',
              }),
            );
            this.logger.warn('RETRY NOT RESCHEDULED (NO DELAY CONFIGURED)', {
              retryId: retry.id,
              requestId: retry.requestId,
              attemptCount: retry.attemptCount,
            });
            terminalError = new Error(
              `Retry exhausted for retryId=${retry.id} requestId=${retry.requestId}`,
            );
          }
        } else if (response.status >= 400) {
          retry.onFail({
            body: response.body,
            next: new Date(),
            status: response.status,
          });
          this.logger.info('RETRY STOPPED (NON-RETRYABLE 4XX)', {
            retryId: retry.id,
            requestId: retry.requestId,
            attemptCount: retry.attemptCount,
            status: response.status,
          });
        } else {
          retry.onSuccess({ body: response.body, status: response.status });
          this.logger.info('RETRY SUCCEEDED', {
            retryId: retry.id,
            requestId: retry.requestId,
            attemptCount: retry.attemptCount,
            status: response.status,
          });
        }

        await this.retryRepository.save(retry);
        this.logger.info('RETRY SAVED', {
          retryId: retry.id,
          requestId: retry.requestId,
          status: retry.status,
          attemptCount: retry.attemptCount,
        });

        if (terminalError) {
          throw terminalError;
        }
      });
    } catch (error) {
      const meta = safeErrorMeta(error);
      this.logger.error('RETRY JOB FAILED', {
        jobId: job.id,
        jobName: job.name,
        data: job.data,
        token,
        errorName: meta.name,
        error: meta.message,
        code: meta.code,
        detail: meta.detail,
        stack: meta.stack,
      });
      throw error;
    }
  }
}
