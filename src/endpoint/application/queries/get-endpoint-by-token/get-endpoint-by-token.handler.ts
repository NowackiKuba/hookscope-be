import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetEndpointByTokenQuery } from './get-endpoint-by-token.query';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token } from '@endpoint/constants';
import { EndpointNotFoundException } from '@endpoint/domain/exceptions/endpoint-not-found.exception';

@QueryHandler(GetEndpointByTokenQuery)
export class GetEndpointByTokenHandler implements IQueryHandler<GetEndpointByTokenQuery> {
  constructor(
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
  ) {}

  async execute(query: GetEndpointByTokenQuery) {
    const endpoint = await this.endpointRepository.findByToken(query.payload.token);
    if (!endpoint) {
      throw new EndpointNotFoundException();
    }
    return endpoint;
  }
}
