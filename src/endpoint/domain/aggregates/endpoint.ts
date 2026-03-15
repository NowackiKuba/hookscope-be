import { randomBytes } from 'crypto';
import { generateUUID } from '@shared/utils/generate-uuid';

export type EndpointProps = {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  token: string;
  isActive?: boolean;
  targetUrl?: string | null;
  secretKey?: string | null;
  requestCount?: number;
  lastRequestAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EndpointJSON = {
  id: string;
  userId: string;
  name: string;
  description: string;
  token: string;
  isActive: boolean;
  targetUrl: string | null;
  secretKey: string | null;
  requestCount: number;
  lastRequestAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Endpoint {
  private _id: string;
  private _userId: string;
  private _name: string;
  private _description: string;
  private _token: string;
  private _isActive: boolean;
  private _targetUrl: string | null;
  private _secretKey: string | null;
  private _requestCount: number;
  private _lastRequestAt: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: EndpointProps) {
    this._id = props.id ?? generateUUID();
    this._userId = props.userId;
    this._name = props.name;
    this._description = props.description ?? '';
    this._token = props.token;
    this._isActive = props.isActive ?? true;
    this._targetUrl = props.targetUrl ?? null;
    this._secretKey = props.secretKey ?? null;
    this._requestCount = props.requestCount ?? 0;
    this._lastRequestAt = props.lastRequestAt ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: {
    userId: string;
    name: string;
    description?: string;
    isActive?: boolean;
    targetUrl?: string | null;
    secretKey?: string | null;
  }): Endpoint {
    const token = randomBytes(16).toString('hex');
    return new Endpoint({
      userId: props.userId,
      name: props.name,
      description: props.description ?? '',
      isActive: props.isActive ?? true,
      targetUrl: props.targetUrl ?? null,
      secretKey: props.secretKey ?? null,
      token,
    });
  }

  static reconstitute(props: EndpointProps): Endpoint {
    return new Endpoint(props);
  }

  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get name(): string {
    return this._name;
  }
  get description(): string {
    return this._description;
  }
  get token(): string {
    return this._token;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get targetUrl(): string | null {
    return this._targetUrl;
  }
  get secretKey(): string | null {
    return this._secretKey;
  }
  get requestCount(): number {
    return this._requestCount;
  }
  get lastRequestAt(): Date | null {
    return this._lastRequestAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON(): EndpointJSON {
    return {
      id: this._id,
      userId: this._userId,
      name: this._name,
      description: this._description,
      token: this._token,
      isActive: this._isActive,
      targetUrl: this._targetUrl,
      secretKey: this._secretKey,
      requestCount: this._requestCount,
      lastRequestAt: this._lastRequestAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
