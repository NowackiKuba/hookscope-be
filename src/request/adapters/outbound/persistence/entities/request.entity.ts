import { EndpointEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint.entity';
import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';

export type RequestEntityProps = {
  id?: string;
  endpoint: EndpointEntity;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  query: Record<string, string>;
  ip?: string | null;
  payloadHash: string;
  contentType?: string | null;
  size: number;
  overlimit: boolean;
  forwardStatus?: number | null;
  forwardedAt?: Date | null;
  forwardError?: string | null;
  receivedAt: Date;
};

@Entity({ tableName: 'requests' })
@Index({ properties: ['endpoint', 'receivedAt'] })
@Index({ properties: ['endpoint', 'overlimit'] })
export class RequestEntity extends BaseEntity implements RequestEntityProps {
  @ManyToOne(() => EndpointEntity, {
    fieldName: 'endpoint_id',
    deleteRule: 'cascade',
  })
  endpoint!: EndpointEntity;

  @Property({ type: 'text' })
  method!: string;

  @Property({ type: 'json' })
  headers: Record<string, string> = {};

  @Property({ type: 'json', nullable: true })
  body: unknown = null;

  @Property({ type: 'json' })
  query: Record<string, string> = {};

  @Property({ type: 'text', nullable: true })
  ip: string | null = null;

  @Property({ type: 'text' })
  payloadHash: string;

  @Property({ type: 'text', nullable: true, fieldName: 'content_type' })
  contentType: string | null = null;

  @Property({ type: 'int', default: 0 })
  size: number = 0;

  @Property({ type: 'boolean', default: false })
  overlimit: boolean = false;

  @Property({ type: 'int', nullable: true, fieldName: 'forward_status' })
  forwardStatus: number | null = null;

  @Property({ type: 'timestamptz', nullable: true, fieldName: 'forwarded_at' })
  forwardedAt: Date | null = null;

  @Property({ type: 'text', nullable: true, fieldName: 'forward_error' })
  forwardError: string | null = null;

  @Property({
    type: 'timestamptz',
    fieldName: 'received_at',
    onCreate: () => new Date(),
  })
  receivedAt!: Date;

  constructor(props: RequestEntityProps) {
    super();
    this.id = props.id;
    this.endpoint = props.endpoint;
    this.method = props.method;
    this.headers = props.headers;
    this.body = props.body;
    this.query = props.query;
    this.ip = props.ip;
    this.payloadHash = props.payloadHash;
    this.contentType = props.contentType;
    this.size = props.size;
    this.overlimit = props.overlimit;
    this.forwardStatus = props.forwardStatus;
    this.forwardedAt = props.forwardedAt;
    this.forwardError = props.forwardError;
    this.receivedAt = props.receivedAt;
  }
}
