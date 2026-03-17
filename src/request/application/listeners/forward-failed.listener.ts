import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ForwardFailedEvent } from '@request/domain/events/forward-failed.event';
import { RETRY_DELAY_MAP, Token } from '@retry/constants';
import { Retry } from '@retry/domain/aggregates/retry';
import { RetryStatus } from '@retry/domain/enums/retry-status.enum';
import { RetryQueuePort } from '@retry/domain/ports/outbound/queue/retry.queue.port';
import { RetryRepositoryPort } from '@retry/domain/ports/repositories/retry.repository.port';
import { LoggerProvider } from '@shared/constants';
import { generateUUID } from '@shared/utils/generate-uuid';
import { addMilliseconds } from 'date-fns';
import { Logger } from 'winston';

@EventsHandler(ForwardFailedEvent)
export class ForwardFailedListener implements IEventHandler<ForwardFailedEvent> {
  constructor(
    @Inject(Token.RetryRepository)
    private readonly retryRepository: RetryRepositoryPort,
    @Inject(Token.RetryQueue)
    private readonly retryQueue: RetryQueuePort,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}

  async handle(event: ForwardFailedEvent) {
    const delay = RETRY_DELAY_MAP.get(1);

    this.logger.info('DELAY: ', delay);

    if (!delay || delay === null) {
      return;
    }

    const retry = Retry.create({
      id: generateUUID(),
      requestId: event.requestId,
      status: RetryStatus.PENDING,
      targetUrl: event.targetUrl,
      attemptCount: 0,
      nextAttemptAt: addMilliseconds(new Date(), delay),
    });

    await this.retryRepository.save(retry);
    await this.retryQueue.scheduleRetry(retry.id, delay);
  }
}
