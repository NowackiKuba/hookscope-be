import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { RequestCleanupQueuePort } from '@request/domain/ports/outbound/queue/request-cleanup.queue.port';
import { Queue } from 'bullmq';

@Injectable()
export class RequestCleanupQueueProducer implements RequestCleanupQueuePort {
  constructor(@InjectQueue('request-cleanup') private readonly queue: Queue) {}

  async enqueue(): Promise<void> {
    await this.queue.add('run-request-cleanup', {});
  }
}
