import { EndpointEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint.entity';
import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

@Entity({ tableName: 'requests' })
@Index({ properties: ['endpoint', 'receivedAt'] })
@Index({ properties: ['endpoint', 'overlimit'] })
export class RequestEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

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
}
