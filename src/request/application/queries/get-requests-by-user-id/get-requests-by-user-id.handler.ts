import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRequestsByUserIdQuery } from './get-requests-by-user-id.query';
import { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { Inject } from '@nestjs/common';
import { Token } from '@request/constants';
import { Page } from '@shared/utils/pagination';
import { Request } from '@request/domain/aggregates/request';
import { UserId } from '@users/domain/value-objects/user-id.vo';

@QueryHandler(GetRequestsByUserIdQuery)
export class GetRequestsByUserIdHandler implements IQueryHandler<GetRequestsByUserIdQuery> {
  constructor(
    @Inject(Token.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
  ) {}

  async execute(query: GetRequestsByUserIdQuery): Promise<Page<Request>> {
    return await this.requestRepository.findByUserId(
      query.payload,
      UserId.create(query.payload.userId),
    );
  }
}
