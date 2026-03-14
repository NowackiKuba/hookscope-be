import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRequestByIdQuery } from './get-request-by-id.query';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token as RequestToken } from '@request/constants';
import { Token as EndpointToken } from '@endpoint/constants';
import { RequestNotFoundException } from '@request/domain/exceptions/request-not-found.exception';

@QueryHandler(GetRequestByIdQuery)
export class GetRequestByIdHandler implements IQueryHandler<GetRequestByIdQuery> {
  constructor(
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(EndpointToken.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
  ) {}

  async execute(query: GetRequestByIdQuery) {
    const { userId, requestId } = query.payload;
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new RequestNotFoundException(requestId);
    }
    const endpoint = await this.endpointRepository.findById(request.endpointId);
    if (!endpoint || endpoint.userId !== userId) {
      throw new RequestNotFoundException(requestId);
    }
    return request;
  }
}
