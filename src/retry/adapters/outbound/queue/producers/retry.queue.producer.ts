import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { RetryQueuePort } from '@retry/domain/ports/outbound/queue/retry.queue.port';
import { Queue } from 'bullmq';

@Injectable()
export class RetryQueueProducer implements RetryQueuePort {
  constructor(
    @InjectQueue('retry')
    private readonly queue: Queue,
  ) {}

  async scheduleRetry(retryId: string, delayMs: number): Promise<void> {
    await this.queue.add('process-retry', { retryId }, { delay: delayMs });
  }
}
