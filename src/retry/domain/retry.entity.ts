import { randomUUID } from 'crypto';

export type RetryStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export class Retry {
  constructor(
    public readonly id: string,
    public readonly requestId: string,
    public readonly targetUrl: string,
    public readonly status: RetryStatus,
    public readonly attemptCount: number,
    public readonly lastAttemptAt: Date | null,
    public readonly nextAttemptAt: Date | null,
    public readonly responseStatus: number | null,
    public readonly responseBody: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: { requestId: string; targetUrl: string }): Retry {
    const nextAttemptAt = new Date(Date.now() + 30_000);
    return new Retry(
      randomUUID(),
      props.requestId,
      props.targetUrl,
      'pending',
      0,
      null,
      nextAttemptAt,
      null,
      null,
      new Date(),
      new Date(),
    );
  }
}
