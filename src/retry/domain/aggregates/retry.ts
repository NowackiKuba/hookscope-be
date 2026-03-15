import { randomUUID } from 'crypto';
import { RetryStatus } from '../enums/retry-status.enum';

export type RetryProps = {
  id: string;
  requestId: string;
  targetUrl: string;
  status: RetryStatus;
  attemptCount: number;
  lastAttemptAt: Date | null;
  nextAttemptAt: Date | null;
  responseStatus: number | null;
  responseBody: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Retry {
  constructor(private readonly props: RetryProps) {}

  static create(props: { requestId: string; targetUrl: string }): Retry {
    const now = new Date();
    const nextAttemptAt = new Date(Date.now() + 30_000);
    return new Retry({
      id: randomUUID(),
      requestId: props.requestId,
      targetUrl: props.targetUrl,
      status: RetryStatus.PENDING,
      attemptCount: 0,
      lastAttemptAt: null,
      nextAttemptAt,
      responseStatus: null,
      responseBody: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get requestId(): string {
    return this.props.requestId;
  }
  get targetUrl(): string {
    return this.props.targetUrl;
  }
  get status(): RetryStatus {
    return this.props.status;
  }
  get attemptCount(): number {
    return this.props.attemptCount;
  }
  get lastAttemptAt(): Date | null {
    return this.props.lastAttemptAt;
  }
  get nextAttemptAt(): Date | null {
    return this.props.nextAttemptAt;
  }
  get responseStatus(): number | null {
    return this.props.responseStatus;
  }
  get responseBody(): string | null {
    return this.props.responseBody;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
