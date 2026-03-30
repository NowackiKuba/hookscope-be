import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EndpointDirectoryRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-directory.repository.port';
import { Token } from '@endpoint/constants';
import { UpdateEndpointDirectoryCommand } from './update-endpoint-directory.command';
import { EndpointDirectoryId } from '@endpoint/domain/value-objects/endpoint-directory-id.vo';
import { EndpointDirectoryNotFoundException } from '@endpoint/domain/exceptions/endpoint-directory-not-found.exception';

@CommandHandler(UpdateEndpointDirectoryCommand)
export class UpdateEndpointDirectoryHandler
  implements ICommandHandler<UpdateEndpointDirectoryCommand>
{
  constructor(
    @Inject(Token.EndpointDirectoryRepository)
    private readonly endpointDirectoryRepository: EndpointDirectoryRepositoryPort,
  ) {}

  async execute(command: UpdateEndpointDirectoryCommand): Promise<void> {
    const { userId, directoryId, name, description, color, icon } =
      command.payload;

    const id = EndpointDirectoryId.create(directoryId);
    const directory = await this.endpointDirectoryRepository.getById(id);

    if (!directory) {
      throw new EndpointDirectoryNotFoundException(directoryId);
    }
    if (directory.userId !== userId) {
      throw new EndpointDirectoryNotFoundException(directoryId);
    }

    directory.updateDetails({ name, description, color, icon });
    await this.endpointDirectoryRepository.update(directory);
  }
}
