import { Injectable } from '@nestjs/common';
import axios, { type AxiosInstance } from 'axios';
import type {
  HttpClientPort,
  HttpResponse,
} from '@shared/domain/ports/outbound/http.client.port';
import { Agent } from 'https';

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

function toErrorResponse(error: unknown): HttpResponse {
  // We only want to treat transport-level failures as errors.
  // HTTP errors (4xx/5xx) should be handled via status codes (validateStatus: () => true).
  if (axios.isAxiosError(error)) {
    const status = typeof error.response?.status === 'number' ? error.response.status : 0;
    const headersRaw =
      error.response?.headers && typeof error.response.headers === 'object'
        ? (error.response.headers as Record<string, unknown>)
        : {};
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(headersRaw)) {
      if (value != null) {
        headers[key] = typeof value === 'string' ? value : String(value);
      }
    }

    const data = error.response?.data;
    const body =
      typeof data === 'string'
        ? data
        : JSON.stringify(
            data ?? {
              message: error.message,
              code: error.code,
            },
          );

    return {
      status,
      body,
      headers,
    };
  }

  return {
    status: 0,
    body: JSON.stringify({ message: String(error) }),
    headers: {},
  };
}

@Injectable()
export class HttpClient implements HttpClientPort {
  private readonly client: AxiosInstance;

  constructor() {
    const agent = new Agent({ rejectUnauthorized: false });
    this.client = axios.create({
      httpsAgent: agent,
      // Important: do not throw on 4xx/5xx; callers handle status codes.
      validateStatus: () => true,
    });
  }

  async get(
    url: string,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    try {
      const res = await this.client.get(url, { headers, responseType: 'json' });
      return toResponse(res);
    } catch (err) {
      return toErrorResponse(err);
    }
  }

  async post(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    try {
      const res = await this.client.post(url, body, { headers });
      return toResponse(res);
    } catch (err) {
      return toErrorResponse(err);
    }
  }

  async put(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    try {
      const res = await this.client.put(url, body, { headers });
      return toResponse(res);
    } catch (err) {
      return toErrorResponse(err);
    }
  }

  async patch(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    try {
      const res = await this.client.patch(url, body, { headers });
      return toResponse(res);
    } catch (err) {
      return toErrorResponse(err);
    }
  }

  async delete(
    url: string,
    headers?: Record<string, string>,
  ): Promise<HttpResponse> {
    try {
      const res = await this.client.delete(url, { headers });
      return toResponse(res);
    } catch (err) {
      return toErrorResponse(err);
    }
  }
}
