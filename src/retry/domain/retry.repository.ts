import type { Retry, RetryStatus } from './retry.entity';

export const RETRY_REPOSITORY = Symbol('RETRY_REPOSITORY');

export interface RetryRepository {
  save(retry: Retry): Promise<void>;
  findById(id: string): Promise<Retry | null>;
  findPending(limit: number): Promise<Retry[]>;
  findByRequestId(requestId: string): Promise<Retry[]>;
  updateAttempt(
    id: string,
    result: {
      status: 'pending' | 'success' | 'failed';
      attemptCount: number;
      lastAttemptAt: Date;
      nextAttemptAt: Date | null;
      responseStatus: number | null;
      responseBody: string | null;
    },
  ): Promise<void>;
  cancel(id: string): Promise<void>;
}
