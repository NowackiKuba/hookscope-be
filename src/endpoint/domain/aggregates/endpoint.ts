import { randomBytes } from 'crypto';
import { generateUUID } from '@shared/utils/generate-uuid';
import {
  EndpointProvider,
  EndpointProviderValue,
} from '../value-objects/endpoint-provider.vo';
import { DEFAULT_EVENT_TYPE_KEY } from '@endpoint/constants';
import { SilenceTreshold } from '../value-objects/silence-treshold.vo';

export type EndpointProps = {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  token: string;
  isActive?: boolean;
  provider?: string;
  webhookUrl: string;
  targetUrl?: string | null;
  secretKey?: string | null;
  requestCount?: number;
  lastRequestAt?: Date | null;
  silenceTreshold?: number;
  schemas?: Record<string, Record<string, string>>;
  lastSchemaAt?: Date;
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
  provider?: EndpointProviderValue;
  targetUrl: string | null;
  webhookUrl: string;
  secretKey: string | null;
  requestCount: number;
  lastRequestAt: Date | null;
  silenceTreshold: number;
  schemas?: Record<string, Record<string, string>>;
  lastSchemaAt?: Date;
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
  private _provider?: EndpointProvider;
  private _targetUrl: string | null;
  private _webhookUrl: string;
  private _secretKey: string | null;
  private _requestCount: number;
  private _lastRequestAt: Date | null;
  private _silenceTreshold: SilenceTreshold;
  private _schemas?: Record<string, Record<string, string>>;
  private _lastSchemaAt?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: EndpointProps) {
    this._id = props.id ?? generateUUID();
    this._userId = props.userId;
    this._name = props.name;
    this._provider = new EndpointProvider(props.provider);
    this._description = props.description ?? '';
    this._token = props.token;
    this._isActive = props.isActive ?? true;
    this._targetUrl = props.targetUrl ?? null;
    this._webhookUrl = props.webhookUrl;
    this._secretKey = props.secretKey ?? null;
    this._schemas = props.schemas ?? null;
    this._silenceTreshold = SilenceTreshold.create(props.silenceTreshold);
    this._lastSchemaAt = props.lastSchemaAt ?? null;
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
    provider?: EndpointProviderValue;
    targetUrl?: string | null;
    silenceTreshold?: number;
    webhookUrl: string;
    token?: string;
    secretKey?: string | null;
  }): Endpoint {
    const token = props.token ? props.token : randomBytes(16).toString('hex');
    return new Endpoint({
      userId: props.userId,
      name: props.name,
      description: props.description ?? '',
      isActive: props.isActive ?? true,
      targetUrl: props.targetUrl ?? null,
      webhookUrl: props.webhookUrl + token,
      secretKey: props.secretKey ?? null,
      provider: props.provider,
      silenceTreshold: props.silenceTreshold,
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
  get provider(): EndpointProvider {
    return this._provider;
  }
  get schemas(): Record<string, Record<string, string>> {
    return this._schemas;
  }
  get lastSchemaAt(): Date {
    return this._lastSchemaAt;
  }
  get webhookUrl(): string {
    return this._webhookUrl;
  }
  get secretKey(): string | null {
    return this._secretKey;
  }
  get requestCount(): number {
    return this._requestCount;
  }
  get silenceTreshold(): SilenceTreshold {
    return this._silenceTreshold;
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

  saveSchema(schema: Record<string, string>, key?: string): void {
    const schemaKey = key ?? DEFAULT_EVENT_TYPE_KEY;

    this._schemas = this._schemas ?? {};
    this._schemas[schemaKey] = { ...schema };

    this._lastSchemaAt = new Date();
  }

  toJSON(): EndpointJSON {
    return {
      id: this._id,
      userId: this._userId,
      name: this._name,
      description: this._description,
      token: this._token,
      isActive: this._isActive,
      provider: this._provider.value,
      targetUrl: this._targetUrl,
      silenceTreshold: this._silenceTreshold.value,
      webhookUrl: this._webhookUrl,
      secretKey: this._secretKey,
      schemas: this._schemas,
      lastSchemaAt: this._lastSchemaAt,
      requestCount: this._requestCount,
      lastRequestAt: this._lastRequestAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
