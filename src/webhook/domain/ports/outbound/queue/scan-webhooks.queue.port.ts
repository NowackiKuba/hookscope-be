export interface ScanWebhooksQueuePort {
  enqueue(requestId: string): Promise<void>;
}
