import { Request } from '@request/domain/aggregates/request';
import { HttpResponse } from './http.client.port';

export type HttpSendOverrides = {
  body?: unknown;
  headers?: Record<string, string>;
};

export interface HttpServicePort {
  send(
    request: Request,
    targetUrl: string,
    overrides?: HttpSendOverrides,
  ): Promise<HttpResponse | null>;
}
