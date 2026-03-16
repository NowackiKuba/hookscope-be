import { Request } from '@request/domain/aggregates/request';
import { HttpResponse } from './http.client.port';

export interface HttpServicePort {
  send(request: Request, targetUrl: string): Promise<HttpResponse | null>;
}
