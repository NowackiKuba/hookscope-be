import type { RequestJSON } from '@request/domain/aggregates/request';

export interface SocketsServicePort {
  emitRequest(endpointId: string, payload: RequestJSON): void;
}
