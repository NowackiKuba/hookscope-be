import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { RetryQueuePort } from '@retry/domain/ports/outbound/queue/retry.queue.port';
import { LoggerProvider } from '@shared/constants';
import { Queue } from 'bullmq';
import { Logger } from 'winston';

@Injectable()
export class RetryQueueProducer implements RetryQueuePort {
  constructor(
    @InjectQueue('retry')
    private readonly queue: Queue,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}

  async scheduleRetry(retryId: string, delayMs: number): Promise<void> {
    this.logger.info('ADDING JOB WITH ID: ', retryId);
    await this.queue.add('process-retry', { retryId }, { delay: delayMs });
  }
}
