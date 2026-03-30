import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetEndpointDirectoriesByUserIdQuery } from './get-endpoint-directories-by-user-id.query';
import type { EndpointDirectoryRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-directory.repository.port';
import { Token } from '@endpoint/constants';
import { UserId } from '@users/domain/value-objects/user-id.vo';
import type { Page } from '@shared/utils/pagination';
import type { EndpointDirectory } from '@endpoint/domain/aggregates/endpoint-directory';

@QueryHandler(GetEndpointDirectoriesByUserIdQuery)
export class GetEndpointDirectoriesByUserIdHandler
  implements IQueryHandler<GetEndpointDirectoriesByUserIdQuery>
{
  constructor(
    @Inject(Token.EndpointDirectoryRepository)
    private readonly endpointDirectoryRepository: EndpointDirectoryRepositoryPort,
  ) {}

  async execute(
    query: GetEndpointDirectoriesByUserIdQuery,
  ): Promise<Page<EndpointDirectory>> {
    const userId = UserId.create(query.payload.userId);
    return this.endpointDirectoryRepository.getByUserId(userId, {
      limit: query.payload.filters?.limit,
      offset: query.payload.filters?.offset,
      orderBy: query.payload.filters?.orderBy,
      orderByField: query.payload.filters?.orderByField,
    });
  }
}
