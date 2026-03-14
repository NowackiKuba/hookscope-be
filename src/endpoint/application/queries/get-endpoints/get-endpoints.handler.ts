import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetEndpointsQuery } from './get-endpoints.query';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token } from '@endpoint/constants';
import type { Endpoint } from '@endpoint/domain/aggregates/endpoint';

@QueryHandler(GetEndpointsQuery)
export class GetEndpointsHandler implements IQueryHandler<GetEndpointsQuery> {
  constructor(
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
  ) {}

  async execute(query: GetEndpointsQuery): Promise<Endpoint[]> {
    return this.endpointRepository.findAllByUserId(query.payload.userId);
  }
}
