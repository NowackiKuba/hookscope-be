import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Token } from '@request/constants';
import { RequestCleanupQueuePort } from '@request/domain/ports/outbound/queue/request-cleanup.queue.port';

@Injectable()
export class CleanupOldRequestsScheduler {
  constructor(
    @Inject(Token.RequestCleanupQueue)
    private readonly requestCleanupQueue: RequestCleanupQueuePort,
  ) {}

  @Cron('0 2 * * *')
  async process() {
    await this.requestCleanupQueue.enqueue();
  }
}
