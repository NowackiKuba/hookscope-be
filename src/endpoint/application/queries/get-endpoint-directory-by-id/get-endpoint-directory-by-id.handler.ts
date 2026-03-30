import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetEndpointDirectoryByIdQuery } from './get-endpoint-directory-by-id.query';
import type { EndpointDirectoryRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-directory.repository.port';
import { Token } from '@endpoint/constants';
import { EndpointDirectoryId } from '@endpoint/domain/value-objects/endpoint-directory-id.vo';
import { EndpointDirectoryNotFoundException } from '@endpoint/domain/exceptions/endpoint-directory-not-found.exception';
import type { EndpointDirectory } from '@endpoint/domain/aggregates/endpoint-directory';

@QueryHandler(GetEndpointDirectoryByIdQuery)
export class GetEndpointDirectoryByIdHandler
  implements IQueryHandler<GetEndpointDirectoryByIdQuery>
{
  constructor(
    @Inject(Token.EndpointDirectoryRepository)
    private readonly endpointDirectoryRepository: EndpointDirectoryRepositoryPort,
  ) {}

  async execute(
    query: GetEndpointDirectoryByIdQuery,
  ): Promise<EndpointDirectory> {
    const { userId, directoryId } = query.payload;
    const id = EndpointDirectoryId.create(directoryId);
    const directory = await this.endpointDirectoryRepository.getById(id);

    if (!directory) {
      throw new EndpointDirectoryNotFoundException(directoryId);
    }
    if (directory.userId !== userId) {
      throw new EndpointDirectoryNotFoundException(directoryId);
    }

    return directory;
  }
}
