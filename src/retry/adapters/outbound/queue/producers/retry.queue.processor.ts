import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { RETRY_DELAY_MAP, Token } from '@retry/constants';
import { Token as RequestToken } from '@request/constants';
import { RetryStatus } from '@retry/domain/enums/retry-status.enum';
import { RetryRepositoryPort } from '@retry/domain/ports/repositories/retry.repository.port';
import { HttpService } from '@shared/constants';
import { Job } from 'bullmq';
import { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { HttpServicePort } from '@shared/domain/ports/outbound/http.service.port';
import { addMilliseconds } from 'date-fns';
import { RetryQueuePort } from '@retry/domain/ports/outbound/queue/retry.queue.port';

@Processor('retry')
export class RetryQueueProcessor extends WorkerHost {
  constructor(
    @Inject(HttpService)
    private readonly httpService: HttpServicePort,
    @Inject(Token.RetryRepository)
    private readonly retryRepository: RetryRepositoryPort,
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(Token.RetryQueue) private readonly queue: RetryQueuePort,
  ) {
    super();
  }

  async process(
    job: Job<{ retryId: string }, any, string>,
    token?: string,
  ): Promise<any> {
    const retry = await this.retryRepository.findById(job.data.retryId);

    if (!retry) {
      // TODO
    }

    const request = await this.requestRepository.findById(retry.requestId);

    if (retry.status !== RetryStatus.PENDING) {
      // TODO
    }

    const response = await this.httpService.send(request, retry.targetUrl);

    if (response.status >= 400) {
      retry.onFail({
        body: response.body,
        next: addMilliseconds(
          new Date(),
          RETRY_DELAY_MAP.get(retry.attemptCount + 1),
        ),
        status: response.status,
      });

      await this.queue.scheduleRetry(
        retry.id,
        RETRY_DELAY_MAP.get(retry.attemptCount + 1),
      );
    } else {
      retry.onSuccess({ body: response.body, status: response.status });
    }

    await this.retryRepository.save(retry);
  }
}
