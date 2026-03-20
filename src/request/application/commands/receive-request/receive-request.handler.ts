import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { Logger } from 'winston';
import { Request } from '@request/domain/aggregates/request';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { Token as RequestToken } from '@request/constants';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token as EndpointToken } from '@endpoint/constants';
import { RequestReceivedEvent } from '@request/domain/events/request-received.event';
import { LoggerProvider } from '@shared/constants';
import { ReceiveRequestCommand } from './receive-request.command';
import { hashPayload } from '@shared/utils/hash-payload';
import { ForwardRequestQueuePort } from '@request/domain/ports/outbound/queue/forward-request.queue.port';

@CommandHandler(ReceiveRequestCommand)
export class ReceiveRequestHandler implements ICommandHandler<ReceiveRequestCommand> {
  constructor(
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(EndpointToken.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    @Inject(RequestToken.ForwardRequestQueue)
    private readonly forwardRequestQueue: ForwardRequestQueuePort,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReceiveRequestCommand): Promise<string> {
    const {
      endpointId,
      method,
      headers,
      body,
      query,
      ip,
      contentType,
      size,
      overlimit,
    } = command.payload;

    const endpoint = await this.endpointRepository.findById(endpointId);

    if (!endpoint) {
      // TODO
    }

    const payloadHash = hashPayload(body);

    const request = overlimit
      ? Request.createOverlimit(endpointId)
      : Request.create({
          endpointId,
          method,
          headers,
          body,
          payloadHash,
          query,
          ip,
          contentType,
          size,
          overlimit: false,
        });

    const saved = await this.requestRepository.save(request);
    await this.endpointRepository.incrementRequestCount(endpointId, new Date());

    this.logger.info('REQUEST RECEIVED', {
      requestId: saved.id,
      endpointId: saved.endpointId,
      overlimit: saved.overlimit,
    });
    this.eventBus.publish(
      new RequestReceivedEvent(
        saved.id,
        saved.endpointId,
        saved.overlimit,
        endpoint?.targetUrl ?? null,
      ),
    );

    const targetUrl = endpoint?.targetUrl;
    if (targetUrl) {
      this.logger.info('ENQUEUE FORWARD REQUEST', {
        requestId: saved.id,
        endpointId: saved.endpointId,
        targetUrl,
      });
      await this.forwardRequestQueue.enqueue({
        requestId: saved.id,
        endpointId: saved.endpointId,
        targetUrl,
      });
    }

    return saved.id;
  }
}
