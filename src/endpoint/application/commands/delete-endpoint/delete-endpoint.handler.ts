import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteEndpointCommand } from './delete-endpoint.command';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token } from '@endpoint/constants';
import { EndpointNotFoundException } from '@endpoint/domain/exceptions/endpoint-not-found.exception';
import { EndpointDeletedEvent } from '@endpoint/domain/events/endpoint-deleted.event';

@CommandHandler(DeleteEndpointCommand)
export class DeleteEndpointHandler implements ICommandHandler<DeleteEndpointCommand> {
  constructor(
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteEndpointCommand): Promise<void> {
    const { userId, endpointId } = command.payload;
    const endpoint = await this.endpointRepository.findById(endpointId);
    if (!endpoint) {
      throw new EndpointNotFoundException(endpointId);
    }
    if (endpoint.userId !== userId) {
      throw new EndpointNotFoundException(endpointId);
    }
    await this.endpointRepository.delete(endpointId);
    this.eventBus.publish(new EndpointDeletedEvent(endpointId));
  }
}
