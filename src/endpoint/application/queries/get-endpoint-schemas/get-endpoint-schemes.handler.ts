import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEndpointSchemasQuery } from './get-endpoint-schemas.query';
import { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Inject } from '@nestjs/common';
import { Token } from '@endpoint/constants';
import { EndpointSchemaRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-schema.repository.port';
import { Page } from '@shared/utils/pagination';
import { EndpointSchema } from '@endpoint/domain/aggregates/endpoint-schema';
import type { Logger } from 'winston';
import { LoggerProvider } from '@shared/constants';
import { EndpointNotFoundException } from '@endpoint/domain/exceptions/endpoint-not-found.exception';

@QueryHandler(GetEndpointSchemasQuery)
export class GetEndpointSchemasHandler implements IQueryHandler<GetEndpointSchemasQuery> {
  constructor(
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    @Inject(Token.EndpointSchemaRepository)
    private readonly endpointSchemaRepository: EndpointSchemaRepositoryPort,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}

  async execute(query: GetEndpointSchemasQuery): Promise<Page<EndpointSchema>> {
    const endpoint = await this.endpointRepository.findById(
      query.payload.endpointId,
    );

    if (!endpoint) {
      this.logger.warn('Endpoint not found while fetching endpoint schemas', {
        endpointId: query.payload.endpointId,
        userId: query.payload.userId,
      });
      throw new EndpointNotFoundException(query.payload.endpointId);
    }

    if (endpoint.userId !== query.payload.userId) {
      this.logger.warn(
        'Endpoint ownership mismatch while fetching endpoint schemas',
        {
          endpointId: query.payload.endpointId,
          userId: query.payload.userId,
          ownerUserId: endpoint.userId,
        },
      );
      throw new EndpointNotFoundException(query.payload.endpointId);
    }

    return await this.endpointSchemaRepository.getByEndpointId(
      {
        eventType: query.payload.eventType,
        isLatest: query.payload.isLatest,
        limit: query.payload.limit ?? 10,
        offset: query.payload.offset ?? 0,
        orderBy: query.payload.orderBy ?? 'desc',
        orderByField: query.payload.orderByField ?? 'createdAt',
      },
      query.payload.endpointId,
    );
  }
}
