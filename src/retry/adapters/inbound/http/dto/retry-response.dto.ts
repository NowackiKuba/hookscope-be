import type { Retry } from '@retry/domain/aggregates/retry';

export type RetryResponseDto = {
  id: string;
  requestId: string;
  targetUrl: string;
  status: string;
  attemptCount: number;
  lastAttemptAt: string | null;
  nextAttemptAt: string | null;
  responseStatus: number | null;
  responseBody: string | null;
  customBody: unknown;
  customHeaders: Record<string, string> | undefined;
  createdAt: string;
  updatedAt: string;
};

export function toRetryResponseDto(retry: Retry): RetryResponseDto {
  const json = retry.toJSON();
  return {
    id: json.id,
    requestId: json.requestId,
    targetUrl: json.targetUrl,
    status: json.status,
    attemptCount: json.attemptCount,
    lastAttemptAt: json.lastAttemptAt?.toISOString() ?? null,
    nextAttemptAt: json.nextAttemptAt?.toISOString() ?? null,
    responseStatus: json.responseStatus ?? null,
    responseBody: json.responseBody ?? null,
    customBody: json.customBody,
    customHeaders: json.customHeaders,
    createdAt: json.createdAt.toISOString(),
    updatedAt: json.updatedAt.toISOString(),
  };
}
