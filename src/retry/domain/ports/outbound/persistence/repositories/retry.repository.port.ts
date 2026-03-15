import { Retry } from '@retry/domain/aggregates/retry';
import { RetryStatus } from '@retry/domain/enums/retry-status.enum';

export interface RetryRepositoryPort {
  save(retry: Retry): Promise<void>;
  findById(id: string): Promise<Retry | null>;
  findPending(limit: number): Promise<Retry[]>;
  findByRequestId(requestId: string): Promise<Retry[]>;
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
  cancel(id: string): Promise<void>;
}
