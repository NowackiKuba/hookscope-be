import { MikroORM } from '@mikro-orm/postgresql';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { HttpService, LoggerProvider } from '@shared/constants';
import { withForkedContext } from '@shared/utils/request-context';
import { JobData } from '@request/domain/ports/outbound/queue/forward-request.queue.port';
import { Token as RequestToken } from '@request/constants';
import { RequestForwardedEvent } from '@request/domain/events/request-forwarded.event';
import { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { HttpServicePort } from '@shared/domain/ports/outbound/http.service.port';
import { Job } from 'bullmq';
import { Logger } from 'winston';

@Processor('forward')
export class ForwardRequestQueueProcessor extends WorkerHost {
  constructor(
    @Inject(LoggerProvider)
    private readonly logger: Logger,
    private readonly orm: MikroORM,
    @Inject(HttpService)
    private readonly httpService: HttpServicePort,
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    private readonly eventBus: EventBus,
  ) {
    super();
  }

  async process(job: Job<JobData, any, string>, token?: string): Promise<any> {
    await withForkedContext(this.orm, async () => {
      const { requestId, endpointId, targetUrl } = job.data;
      this.logger.info('FORWARD JOB START', {
        jobId: job.id,
        requestId,
        endpointId,
        targetUrl,
        token,
      });

      const request = await this.requestRepository.findById(requestId);
      if (!request) {
        this.logger.warn('FORWARD JOB REQUEST NOT FOUND', {
          jobId: job.id,
          requestId,
          endpointId,
        });
        return;
      }

      try {
        const response = await this.httpService.send(request, targetUrl);
        const forwardError = response.status >= 400 ? response.body : null;
        await this.requestRepository.updateForwardResult(requestId, {
          forwardStatus: response.status,
          forwardedAt: new Date(),
          forwardError,
        });

        this.logger.info('FORWARD JOB DONE', {
          jobId: job.id,
          requestId,
          endpointId,
          status: response.status,
          error: forwardError,
        });

        await this.eventBus.publish(
          new RequestForwardedEvent(
            requestId,
            endpointId,
            response.status,
            targetUrl,
            forwardError,
          ),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await this.requestRepository.updateForwardResult(requestId, {
          forwardStatus: 0,
          forwardedAt: new Date(),
          forwardError: message,
        });

        this.logger.error('FORWARD JOB FAILED', {
          jobId: job.id,
          requestId,
          endpointId,
          error: message,
        });

        await this.eventBus.publish(
          new RequestForwardedEvent(requestId, endpointId, 0, targetUrl, message),
        );
      }
    });
  }
}
