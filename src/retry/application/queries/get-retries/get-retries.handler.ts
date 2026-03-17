import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetRetriesQueue } from './get-retries.queue';
import { RetryRepositoryPort } from '@retry/domain/ports/repositories/retry.repository.port';
import { Inject } from '@nestjs/common';
import { Token } from '@retry/constants';
import { Page } from '@shared/utils/pagination';
import { Retry } from '@retry/domain/aggregates/retry';
import { UserId } from '@users/domain/value-objects/user-id.vo';
import { RetryStatus } from '@retry/domain/enums/retry-status.enum';

@QueryHandler(GetRetriesQueue)
export class GetRetriesHandler implements IQueryHandler<GetRetriesQueue> {
  constructor(
    @Inject(Token.RetryRepository)
    private readonly retryRepository: RetryRepositoryPort,
  ) {}

  async execute(query: GetRetriesQueue): Promise<Page<Retry>> {
    return await this.retryRepository.getByUserId(
      {
        ...query.payload,
        ...(query.payload.status != null && {
          status: query.payload.status as RetryStatus,
        }),
      },
      UserId.create(query.payload.userId),
    );
  }
}
