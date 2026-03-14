import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetEndpointByIdQuery } from './get-endpoint-by-id.query';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token } from '@endpoint/constants';
import { EndpointNotFoundException } from '@endpoint/domain/exceptions/endpoint-not-found.exception';

@QueryHandler(GetEndpointByIdQuery)
export class GetEndpointByIdHandler implements IQueryHandler<GetEndpointByIdQuery> {
  constructor(
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
  ) {}

  async execute(query: GetEndpointByIdQuery) {
    const { userId, endpointId } = query.payload;
    const endpoint = await this.endpointRepository.findById(endpointId);
    if (!endpoint) {
      throw new EndpointNotFoundException(endpointId);
    }
    if (endpoint.userId !== userId) {
      throw new EndpointNotFoundException(endpointId);
    }
    return endpoint;
  }
}
