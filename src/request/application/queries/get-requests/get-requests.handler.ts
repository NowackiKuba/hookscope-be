import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRequestsQuery } from './get-requests.query';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token as RequestToken } from '@request/constants';
import { Token as EndpointToken } from '@endpoint/constants';
import { EndpointNotFoundException } from '@endpoint/domain/exceptions/endpoint-not-found.exception';
import type { Request } from '@request/domain/aggregates/request';

export type GetRequestsResult = {
  data: Array<{
    id: string;
    endpointId: string;
    method: string;
    headers: Record<string, string>;
    body: unknown;
    query: Record<string, string>;
    ip: string | null;
    contentType: string | null;
    size: number;
    overlimit: boolean;
    forwardStatus: number | null;
    forwardedAt: string | null;
    forwardError: string | null;
    receivedAt: string;
  }>;
  total: number;
  limit: number;
  offset: number;
};

function requestToItem(r: Request): GetRequestsResult['data'][number] {
  return {
    id: r.id,
    endpointId: r.endpointId,
    method: r.method,
    headers: r.headers,
    body: r.body,
    query: r.query,
    ip: r.ip,
    contentType: r.contentType,
    size: r.size,
    overlimit: r.overlimit,
    forwardStatus: r.forwardStatus,
    forwardedAt: r.forwardedAt?.toISOString() ?? null,
    forwardError: r.forwardError,
    receivedAt: r.receivedAt.toISOString(),
  };
}

@QueryHandler(GetRequestsQuery)
export class GetRequestsHandler implements IQueryHandler<GetRequestsQuery> {
  constructor(
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(EndpointToken.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
  ) {}

  async execute(query: GetRequestsQuery): Promise<GetRequestsResult> {
    const { userId, endpointId, limit, offset } = query.payload;
    const endpoint = await this.endpointRepository.findById(endpointId);
    if (!endpoint || endpoint.userId !== userId) {
      throw new EndpointNotFoundException(endpointId);
    }
    const page = await this.requestRepository.findByEndpointId(
      { limit, offset, orderBy: 'desc', orderByField: 'receivedAt' },
      endpointId,
    );
    return {
      data: page.data.map(requestToItem),
      total: page.page.totalCount ?? page.data.length,
      limit: page.page.limit ?? limit,
      offset: page.page.offset ?? offset,
    };
  }
}
