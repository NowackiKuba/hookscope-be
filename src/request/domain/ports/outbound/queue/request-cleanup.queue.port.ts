export const REQUEST_CLEANUP_QUEUE = Symbol('REQUEST_CLEANUP_QUEUE');

export interface RequestCleanupQueuePort {
  enqueue(): Promise<void>;
}
