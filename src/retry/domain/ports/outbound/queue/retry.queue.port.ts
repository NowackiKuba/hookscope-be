export interface RetryQueuePort {
  scheduleRetry(retryId: string, delayMs: number): Promise<void>;
}
