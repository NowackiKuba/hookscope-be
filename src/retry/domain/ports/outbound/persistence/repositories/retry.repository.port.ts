import { Retry } from '@retry/domain/aggregates/retry';
import { RetryStatus } from '@retry/domain/enums/retry-status.enum';
import { BaseFilters } from '@shared/domain/types/base-filters.type';
import { Page } from '@shared/utils/pagination';
import { UserId } from '@users/domain/value-objects/user-id.vo';

export type RetryFilters = BaseFilters & {
  requestId?: string;
  status?: RetryStatus;
};

export interface RetryRepositoryPort {
  save(retry: Retry): Promise<void>;
  findById(id: string): Promise<Retry | null>;
  findByIdAndUserId(id: string, userId: UserId): Promise<Retry | null>;
  findPending(limit: number): Promise<Retry[]>;
  findByRequestId(requestId: string): Promise<Retry>;
  updateAttempt(
    id: string,
    result: {
      status: RetryStatus.PENDING | RetryStatus.SUCCESS | RetryStatus.FAILED;
      attemptCount: number;
      lastAttemptAt: Date;
      nextAttemptAt: Date | null;
      responseStatus: number | null;
      responseBody: string | null;
    },
  ): Promise<void>;
  getByUserId(filters: RetryFilters, userId: UserId): Promise<Page<Retry>>;
  cancel(id: string): Promise<void>;
}
