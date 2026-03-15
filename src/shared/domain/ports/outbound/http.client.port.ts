export interface HttpResponse {
  status: number;
  body: string;
  headers: Record<string, string>;
}

export interface HttpClientPort {
  get(url: string, headers?: Record<string, string>): Promise<HttpResponse>;
  post(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<HttpResponse>;
  put(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<HttpResponse>;
  patch(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<HttpResponse>;
  delete(url: string, headers?: Record<string, string>): Promise<HttpResponse>;
}
