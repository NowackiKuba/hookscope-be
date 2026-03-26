import { generateUUID } from '@shared/utils/generate-uuid';

export type RequestProps = {
  id?: string;
  endpointId: string;
  method: string;
  headers: Record<string, string>;
  body: Record<string, unknown> | null;
  query: Record<string, string>;
  ip: string | null;
  contentType: string | null;
  payloadHash: string;
  size: number;
  overlimit: boolean;
  rawBody?: string | null;
  forwardStatus?: number | null;
  forwardedAt?: Date | null;
  forwardError?: string | null;
  receivedAt?: Date;
};

export type RequestJSON = RequestProps & {
  id: string;
  forwardStatus: number | null;
  payloadHash: string;
  forwardedAt: Date | null;
  forwardError: string | null;
  receivedAt: Date;
  rawBody: string | null;
};

export class Request {
  private _id: string;
  private _endpointId: string;
  private _method: string;
  private _headers: Record<string, string>;
  private _body: Record<string, unknown> | null;
  private _query: Record<string, string>;
  private _ip: string | null;
  private _payloadHash: string;
  private _contentType: string | null;
  private _size: number;
  private _overlimit: boolean;
  private _rawBody: string | null;
  private _forwardStatus: number | null;
  private _forwardedAt: Date | null;
  private _forwardError: string | null;
  private _receivedAt: Date;

  private constructor(props: RequestProps) {
    this._id = props.id ?? generateUUID();
    this._endpointId = props.endpointId;
    this._method = props.method;
    this._payloadHash = props.payloadHash;
    this._headers = props.headers ?? {};
    this._body = props.body ?? null;
    this._query = props.query ?? {};
    this._ip = props.ip ?? null;
    this._contentType = props.contentType ?? null;
    this._size = props.size ?? 0;
    this._overlimit = props.overlimit ?? false;
    this._rawBody = props.rawBody ?? null;
    this._forwardStatus = props.forwardStatus ?? null;
    this._forwardedAt = props.forwardedAt ?? null;
    this._forwardError = props.forwardError ?? null;
    this._receivedAt = props.receivedAt ?? new Date();
  }

  static create(props: RequestProps): Request {
    return new Request(props);
  }

  static createOverlimit(endpointId: string): Request {
    return new Request({
      endpointId,
      method: 'POST',
      headers: {},
      body: null,
      payloadHash: '',
      query: {},
      ip: null,
      contentType: null,
      size: 0,
      overlimit: true,
    });
  }

  static reconstitute(
    props: RequestProps & { id: string; receivedAt?: Date },
  ): Request {
    return new Request(props);
  }

  get id(): string {
    return this._id;
  }
  get endpointId(): string {
    return this._endpointId;
  }
  get method(): string {
    return this._method;
  }
  get payloadHash(): string {
    return this._payloadHash;
  }
  get headers(): Record<string, string> {
    return this._headers;
  }
  get body(): Record<string, unknown> | null {
    return this._body;
  }
  get query(): Record<string, string> {
    return this._query;
  }
  get ip(): string | null {
    return this._ip;
  }
  get contentType(): string | null {
    return this._contentType;
  }
  get size(): number {
    return this._size;
  }
  get overlimit(): boolean {
    return this._overlimit;
  }
  get forwardStatus(): number | null {
    return this._forwardStatus;
  }
  get forwardedAt(): Date | null {
    return this._forwardedAt;
  }
  get forwardError(): string | null {
    return this._forwardError;
  }
  get receivedAt(): Date {
    return this._receivedAt;
  }

  get rawBody(): string | null {
    return this._rawBody;
  }

  onForward(status: number, error?: string) {
    this._forwardStatus = status;
    this._forwardedAt = new Date();
    this._forwardError = error;
  }

  toJSON(): RequestJSON {
    return {
      id: this._id,
      endpointId: this._endpointId,
      method: this._method,
      payloadHash: this._payloadHash,
      headers: this._headers,
      body: this._body,
      query: this._query,
      ip: this._ip,
      contentType: this._contentType,
      size: this._size,
      overlimit: this._overlimit,
      rawBody: this._rawBody,
      forwardStatus: this._forwardStatus,
      forwardedAt: this._forwardedAt,
      forwardError: this._forwardError,
      receivedAt: this._receivedAt,
    };
  }
}
