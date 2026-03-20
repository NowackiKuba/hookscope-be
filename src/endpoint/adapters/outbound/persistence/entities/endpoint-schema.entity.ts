import { Entity, ManyToOne, OneToOne, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { EndpointEntity } from './endpoint.entity';
import { WebhookAlertEntity } from '@webhook/adapters/outbound/persistence/entities/webhook-alert.entity';
import { EndpointSchemaGeneratedValue } from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';

export type EndpointSchemaEntityProps = {
  id?: string;
  endpoint: EndpointEntity;
  eventType?: string | null;
  version: number;
  isLatest: boolean;
  prevVersion?: EndpointSchemaEntity | null;
  schema: Record<string, string>;
  generated: EndpointSchemaGeneratedValue;
  alert?: WebhookAlertEntity | null;
  generatedAt: Date;
};

@Entity({ tableName: 'endpoint_schemas' })
@Unique({ properties: ['endpoint', 'eventType', 'version'] })
export class EndpointSchemaEntity
  extends BaseEntity
  implements EndpointSchemaEntityProps
{
  @ManyToOne(() => EndpointEntity, { fieldName: 'endpoint_id' })
  endpoint: EndpointEntity;

  @Property({ type: 'text', nullable: true, fieldName: 'event_type' })
  eventType: string | null;

  @Property({ type: 'int', default: 1 })
  version: number;

  @Property({ type: 'boolean', default: true, fieldName: 'is_latest' })
  isLatest: boolean;

  @ManyToOne(() => EndpointSchemaEntity, { nullable: true, fieldName: 'prev_version_id' })
  prevVersion?: EndpointSchemaEntity | null;

  @Property({ type: 'jsonb' })
  schema: Record<string, string>;

  @Property({ type: 'jsonb' })
  generated: EndpointSchemaGeneratedValue;

  @OneToOne(() => WebhookAlertEntity, { nullable: true })
  alert?: WebhookAlertEntity | null;

  @Property({ type: 'timestamptz', fieldName: 'generated_at' })
  generatedAt: Date = new Date();

  constructor(props: EndpointSchemaEntityProps) {
    super();
    this.id = props.id;
    this.endpoint = props.endpoint;
    this.eventType = props.eventType ?? null;
    this.version = props.version;
    this.isLatest = props.isLatest;
    this.prevVersion = props.prevVersion ?? null;
    this.schema = props.schema;
    this.generated = props.generated;
    this.alert = props.alert ?? null;
    this.generatedAt = props.generatedAt;
  }
}
