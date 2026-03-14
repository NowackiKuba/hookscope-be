import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReceiveRequestCommand } from './receive-request.command';
import { Request } from '@request/domain/aggregates/request';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { Token as RequestToken } from '@request/constants';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token as EndpointToken } from '@endpoint/constants';
import { RequestReceivedEvent } from '@request/domain/events/request-received.event';

@CommandHandler(ReceiveRequestCommand)
export class ReceiveRequestHandler implements ICommandHandler<ReceiveRequestCommand> {
  constructor(
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(EndpointToken.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReceiveRequestCommand): Promise<string> {
    const { endpointId, method, headers, body, query, ip, contentType, size, overlimit } =
      command.payload;

    const request = overlimit
      ? Request.createOverlimit(endpointId)
      : Request.create({
          endpointId,
          method,
          headers,
          body,
          query,
          ip,
          contentType,
          size,
          overlimit: false,
        });

    const saved = await this.requestRepository.save(request);
    await this.endpointRepository.incrementRequestCount(endpointId, new Date());
    this.eventBus.publish(
      new RequestReceivedEvent(saved.id, saved.endpointId, saved.overlimit),
    );
    return saved.id;
  }
}
