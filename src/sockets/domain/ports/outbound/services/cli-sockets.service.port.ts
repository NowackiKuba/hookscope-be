import type { RequestJSON } from '@request/domain/aggregates/request';

export const CLI_SOCKETS_SERVICE = Symbol('CliSocketsService');

export interface CliSocketsServicePort {
  emitRequest(endpointId: string, payload: RequestJSON): void;
}
