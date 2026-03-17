import { Inject, Injectable } from '@nestjs/common';
import { Request } from '@request/domain/aggregates/request';
import { HttpClientProvider } from '@shared/constants';
import {
  HttpClientPort,
  HttpResponse,
} from '@shared/domain/ports/outbound/http.client.port';
import {
  HttpSendOverrides,
  HttpServicePort,
} from '@shared/domain/ports/outbound/http.service.port';

@Injectable()
export class HttpService implements HttpServicePort {
  constructor(
    @Inject(HttpClientProvider)
    private readonly httpClient: HttpClientPort,
  ) {}

  async send(
    request: Request,
    targetUrl: string,
    overrides?: HttpSendOverrides,
  ): Promise<HttpResponse | null> {
    const headers = {
      ...request.headers,
      ...(overrides?.headers ?? {}),
    };
    delete headers['host'];
    delete headers['content-length'];
    delete headers['transfer-encoding'];
    delete headers['connection'];

    const body =
      overrides?.body !== undefined ? overrides.body : request.body ?? undefined;

    const m = request.method.toLowerCase();

    if (m === 'get') {
      return this.httpClient.get(targetUrl, headers);
    } else if (m === 'post') {
      return this.httpClient.post(targetUrl, body, headers);
    } else if (m === 'put') {
      return this.httpClient.put(targetUrl, body, headers);
    } else if (m === 'patch') {
      return this.httpClient.patch(targetUrl, body, headers);
    } else if (m === 'delete') {
      return this.httpClient.delete(targetUrl, headers);
    }

    return null;
  }
}
