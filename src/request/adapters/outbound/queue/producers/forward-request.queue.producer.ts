import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ForwardRequestQueuePort } from '@request/domain/ports/outbound/queue/forward-request.queue.port';
import { Queue } from 'bullmq';

@Injectable()
export class ForwardRequestQueueProducer implements ForwardRequestQueuePort {
  constructor(@InjectQueue('forward') private readonly queue: Queue) {}

  async enqueue(data: {
    targetUrl: string;
    requestId: string;
    endpointId: string;
  }): Promise<void> {
    await this.queue.add('forward', data, {});
  }
}
