import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ScanWebhooksQueuePort } from '@webhook/domain/ports/outbound/queue/scan-webhooks.queue.port';
import { Queue } from 'bullmq';

@Injectable()
export class ScanWebhooksQueueProducer implements ScanWebhooksQueuePort {
  constructor(@InjectQueue('scan-webhooks') private readonly queue: Queue) {}

  async enqueue(requestId: string): Promise<void> {
    await this.queue.add('scan', { requestId });
  }
}
