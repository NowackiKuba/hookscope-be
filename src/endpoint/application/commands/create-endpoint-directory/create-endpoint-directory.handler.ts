import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEndpointCommand } from '../create-endpoint/create-endpoint.command';
import { EndpointDirectoryRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-directory.repository.port';
import { Inject } from '@nestjs/common';
import { Token } from '@endpoint/constants';
import { EndpointDirectory } from '@endpoint/domain/aggregates/endpoint-directory';
import { generateUUID } from '@shared/utils/generate-uuid';
import { CreateEndpointDirectoryCommand } from './create-endpoint-directory.command';

@CommandHandler(CreateEndpointDirectoryCommand)
export class CreateEndpointDirectoryHandler implements ICommandHandler<CreateEndpointDirectoryCommand> {
  constructor(
    @Inject(Token.EndpointDirectoryRepository)
    private readonly endpointDirectoryRepository: EndpointDirectoryRepositoryPort,
  ) {}

  async execute(command: CreateEndpointDirectoryCommand): Promise<string> {
    const endpointDirectory = EndpointDirectory.create({
      id: generateUUID(),
      name: command.payload.name,
      description: command.payload.description,
      icon: command.payload.icon,
      color: command.payload.color,
      userId: command.payload.userId,
    });

    await this.endpointDirectoryRepository.create(endpointDirectory);

    return endpointDirectory.id.value;
  }
}
