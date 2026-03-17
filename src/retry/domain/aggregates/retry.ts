import { randomUUID } from 'crypto';
import { RetryStatus } from '../enums/retry-status.enum';
import { generateUUID } from '@shared/utils/generate-uuid';
import { Request } from '@request/domain/aggregates/request';

export type RetryProps = {
  id?: string;
  requestId: string;
  request?: Request;
  targetUrl: string;
  status: RetryStatus;
  attemptCount?: number;
  lastAttemptAt?: Date | null;
  nextAttemptAt?: Date | null;
  responseStatus?: number | null;
  responseBody?: string | null;
  customBody?: unknown;
  customHeaders?: Record<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
};

export type RetryJSON = {
  id: string;
  requestId: string;
  request?: Request;
  targetUrl: string;
  status: RetryStatus;
  attemptCount: number;
  lastAttemptAt: Date | null;
  nextAttemptAt: Date | null;
  responseStatus: number | null;
  responseBody: string | null;
  customBody?: unknown;
  customHeaders?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
};

export class Retry {
  private _id: string;
  private _requestId: string;
  private _request?: Request;
  private _targetUrl: string;
  private _status: RetryStatus;
  private _attemptCount: number;
  private _lastAttemptAt: Date | null;
  private _nextAttemptAt: Date | null;
  private _responseStatus: number | null;
  private _responseBody: string | null;
  private _customBody?: unknown;
  private _customHeaders?: Record<string, string>;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(private readonly props: RetryProps) {
    this._id = props.id ?? generateUUID();
    this._requestId = props.requestId;
    this._targetUrl = props.targetUrl;
    this._status = props.status;
    this._request = props.request;
    this._attemptCount = props.attemptCount;
    this._lastAttemptAt = props.lastAttemptAt;
    this._nextAttemptAt = props.nextAttemptAt;
    this._responseStatus = props.responseStatus;
    this._responseBody = props.responseBody;
    this._customBody = props.customBody;
    this._customHeaders = props.customHeaders;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: RetryProps): Retry {
    return new Retry(props);
  }

  get id(): string {
    return this._id;
  }
  get requestId(): string {
    return this._requestId;
  }
  get request(): Request {
    return this._request;
  }
  get targetUrl(): string {
    return this._targetUrl;
  }
  get status(): RetryStatus {
    return this._status;
  }
  get attemptCount(): number {
    return this._attemptCount;
  }
  get lastAttemptAt(): Date | null {
    return this._lastAttemptAt;
  }
  get nextAttemptAt(): Date | null {
    return this._nextAttemptAt;
  }
  get responseStatus(): number | null {
    return this._responseStatus;
  }
  get responseBody(): string | null {
    return this._responseBody;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  get customBody(): unknown {
    return this._customBody;
  }
  get customHeaders(): Record<string, string> {
    return this._customHeaders;
  }

  onFail(props: { body: string; status: number; next: Date }) {
    this._attemptCount = this._attemptCount + 1;
    if (this._attemptCount >= 5) {
      this._status = RetryStatus.FAILED;
    }

    this._responseBody = props.body;
    this._responseStatus = props.status;
    this._lastAttemptAt = this._nextAttemptAt;
    this._nextAttemptAt = props.next;
  }

  onSuccess(props: { body: string; status: number }) {
    this._status = RetryStatus.SUCCESS;
    this._responseStatus = props.status;
    this._responseBody = props.body;
    this._nextAttemptAt = null;
  }

  /**
   * Update optional body and headers to use when running this retry manually.
   * Overrides the original request body/headers when set.
   */
  updatePayload(body?: unknown, headers?: Record<string, string>): void {
    if (body !== undefined) this._customBody = body;
    if (headers !== undefined) this._customHeaders = headers;
  }

  toJSON(): RetryJSON {
    return {
      id: this._id,
      requestId: this._requestId,
      request: this._request,
      targetUrl: this._targetUrl,
      status: this._status,
      attemptCount: this._attemptCount,
      lastAttemptAt: this._lastAttemptAt,
      nextAttemptAt: this._nextAttemptAt,
      responseStatus: this._responseStatus,
      customBody: this._customBody,
      customHeaders: this._customHeaders,
      responseBody: this._responseBody,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
