import type { RequestJSON } from '@request/domain/aggregates/request';

export interface SocketsServicePort {
  emitRequest(endpointId: string, payload: RequestJSON): void;
  emitForwardUpdate(
    endpointId: string,
    payload: {
      requestId: string;
      forwardStatus: number;
      forwardError: string | null;
    },
  ): void;
}
