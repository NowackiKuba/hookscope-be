import { randomUUID } from 'crypto';

export class Request {
  constructor(
    public readonly id: string,
    public readonly endpointId: string,
    public readonly method: string,
    public readonly headers: Record<string, string>,
    public readonly body: unknown,
    public readonly query: Record<string, string>,
    public readonly ip: string | null,
    public readonly contentType: string | null,
    public readonly size: number,
    public readonly overlimit: boolean,
    public readonly forwardStatus: number | null,
    public readonly forwardedAt: Date | null,
    public readonly forwardError: string | null,
    public readonly receivedAt: Date,
  ) {}

  static create(props: {
    endpointId: string;
    method: string;
    headers: Record<string, string>;
    body: unknown;
    query: Record<string, string>;
    ip: string | null;
    contentType: string | null;
    size: number;
  }): Request {
    return new Request(
      randomUUID(),
      props.endpointId,
      props.method,
      props.headers,
      props.body,
      props.query,
      props.ip,
      props.contentType,
      props.size,
      false,
      null,
      null,
      null,
      new Date(),
    );
  }

  static createOverlimit(endpointId: string): Request {
    return new Request(
      randomUUID(),
      endpointId,
      'UNKNOWN',
      {},
      null,
      {},
      null,
      null,
      0,
      true,
      null,
      null,
      null,
      new Date(),
    );
  }
}
