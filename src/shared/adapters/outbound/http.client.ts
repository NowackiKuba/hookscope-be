import { Injectable } from '@nestjs/common';
import axios, { type AxiosInstance } from 'axios';
import type {
  HttpClientPort,
  HttpResponse,
} from '@shared/domain/ports/outbound/http.client.port';
import https from 'https';

function toResponse(axiosRes: {
  status: number;
  data: unknown;
  headers: Record<string, unknown>;
}): HttpResponse {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(axiosRes.headers)) {
    if (value != null) {
      headers[key] = typeof value === 'string' ? value : String(value);
    }
  }
  const body =
    typeof axiosRes.data === 'string'
      ? axiosRes.data
      : JSON.stringify(axiosRes.data ?? '');
  return {
    status: axiosRes.status,
    body,
    headers,
  };
}

@Injectable()
export class HttpClient implements HttpClientPort {
  private readonly client: AxiosInstance;

  constructor() {
    const agent = new https.Agent({ rejectUnauthorized: false });
    this.client = axios.create({ httpsAgent: agent });
  }

  async get(
    url: string,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    const res = await this.client.get(url, { headers, responseType: 'json' });
    return toResponse(res);
  }

  async post(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    const res = await this.client.post(url, body, { headers });
    return toResponse(res);
  }

  async put(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    const res = await this.client.put(url, body, { headers });
    return toResponse(res);
  }

  async patch(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    const res = await this.client.patch(url, body, { headers });
    return toResponse(res);
  }

  async delete(
    url: string,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    const res = await this.client.delete(url, { headers });
    return toResponse(res);
  }
}
