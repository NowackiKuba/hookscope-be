import { Inject, Injectable } from '@nestjs/common';
import { Request } from '@request/domain/aggregates/request';
import { HttpClientProvider } from '@shared/constants';
import {
  HttpClientPort,
  HttpResponse,
} from '@shared/domain/ports/outbound/http.client.port';
import { HttpServicePort } from '@shared/domain/ports/outbound/http.service.port';

@Injectable()
export class HttpService implements HttpServicePort {
  constructor(
    @Inject(HttpClientProvider)
    private readonly httpClient: HttpClientPort,
  ) {}

  async send(
    request: Request,
    targetUrl: string,
  ): Promise<HttpResponse | null> {
    const headers = { ...request.headers };
    delete headers['host'];
    delete headers['content-length'];
    delete headers['transfer-encoding'];
    delete headers['connection'];

    const m = request.method.toLowerCase();

    if (m === 'get') {
      return this.httpClient.get(targetUrl, headers);
    } else if (m === 'post') {
      return this.httpClient.post(
        targetUrl,
        request.body ?? undefined,
        headers,
      );
    } else if (m === 'put') {
      return this.httpClient.put(targetUrl, request.body ?? undefined, headers);
    } else if (m === 'patch') {
      return this.httpClient.patch(
        targetUrl,
        request.body ?? undefined,
        headers,
      );
    } else if (m === 'delete') {
      return this.httpClient.delete(targetUrl, headers);
    }

    return null;
  }
}
