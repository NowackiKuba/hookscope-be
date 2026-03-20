import { generateUUID } from '@shared/utils/generate-uuid';
import {
  EndpointSchemaGenerated,
  type EndpointSchemaGeneratedValue,
} from '../value-objects/endpoint-schema-generated.vo';

export type EndpointSchemaProps = {
  id: string;
  endpointId: string;
  eventType: string | null;
  version: number;
  isLatest: boolean;
  schema: Record<string, string>;
  generated: EndpointSchemaGenerated | EndpointSchemaGeneratedValue;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type EndpointSchemaJSON = {
  id: string;
  endpointId: string;
  eventType: string | null;
  version: number;
  isLatest: boolean;
  schema: Record<string, string>;
  generated: EndpointSchemaGeneratedValue;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeGenerated(
  generated: EndpointSchemaGenerated | EndpointSchemaGeneratedValue,
): EndpointSchemaGenerated {
  return generated instanceof EndpointSchemaGenerated
    ? generated
    : EndpointSchemaGenerated.create(generated);
}

export class EndpointSchema {
  private readonly _id: string;
  private readonly _endpointId: string;
  private readonly _eventType: string | null;
  private readonly _version: number;
  private readonly _isLatest: boolean;
  private readonly _schema: Record<string, string>;
  private readonly _generated: EndpointSchemaGenerated;
  private readonly _generatedAt: Date;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  private constructor(props: EndpointSchemaProps) {
    this._id = props.id;
    this._endpointId = props.endpointId;
    this._eventType = props.eventType;
    this._version = props.version;
    this._isLatest = props.isLatest;
    this._schema = props.schema;
    this._generated = normalizeGenerated(props.generated);
    this._generatedAt = props.generatedAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static reconstitute(props: EndpointSchemaProps): EndpointSchema {
    return new EndpointSchema(props);
  }

  static create(props: {
    endpointId: string;
    eventType: string | null;
    version: number;
    schema: Record<string, string>;
    generated?: EndpointSchemaGeneratedValue;
  }): EndpointSchema {
    const now = new Date();
    return new EndpointSchema({
      id: generateUUID(),
      endpointId: props.endpointId,
      eventType: props.eventType,
      version: props.version,
      isLatest: true,
      schema: props.schema,
      generated: EndpointSchemaGenerated.create(props.generated),
      generatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  get id(): string {
    return this._id;
  }
  get endpointId(): string {
    return this._endpointId;
  }
  get eventType(): string | null {
    return this._eventType;
  }
  get version(): number {
    return this._version;
  }
  get isLatest(): boolean {
    return this._isLatest;
  }
  get schema(): Record<string, string> {
    return this._schema;
  }
  get generated(): EndpointSchemaGeneratedValue {
    return this._generated.value;
  }
  get generatedAt(): Date {
    return this._generatedAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON(): EndpointSchemaJSON {
    return {
      id: this._id,
      endpointId: this._endpointId,
      eventType: this._eventType,
      version: this._version,
      isLatest: this._isLatest,
      schema: this._schema,
      generated: this._generated.value,
      generatedAt: this._generatedAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
