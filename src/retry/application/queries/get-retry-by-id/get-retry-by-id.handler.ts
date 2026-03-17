import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Token } from '@retry/constants';
import { RetryRepositoryPort } from '@retry/domain/ports/repositories/retry.repository.port';
import { GetRetryByIdQuery } from './get-retry-by-id.query';
import { Retry } from '@retry/domain/aggregates/retry';
import { UserId } from '@users/domain/value-objects/user-id.vo';
import { RetryNotFoundException } from '@retry/domain/exceptions';

@QueryHandler(GetRetryByIdQuery)
export class GetRetryByIdHandler implements IQueryHandler<GetRetryByIdQuery> {
  constructor(
    @Inject(Token.RetryRepository)
    private readonly retryRepository: RetryRepositoryPort,
  ) {}

  async execute(query: GetRetryByIdQuery): Promise<Retry> {
    const retry = await this.retryRepository.findByIdAndUserId(
      query.retryId,
      UserId.create(query.userId),
    );
    if (!retry) {
      throw new RetryNotFoundException(query.retryId);
    }
    return retry;
  }
}
