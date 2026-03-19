export interface ScanContext {
  requestId: string;
  endpointId: string;
  userId: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
  eventType: string | null;
  payloadHash: string;
  receivedAt: Date;
}

export interface ScanServicePort {
  scan(context: ScanContext): Promise<void>;
}
