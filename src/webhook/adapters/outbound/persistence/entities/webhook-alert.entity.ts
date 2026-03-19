import { EndpointEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint.entity';
import { Entity, Index, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { generateUUID } from '@shared/utils/generate-uuid';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';
import { AlertMetadataValue } from '@webhook/domain/value-objects/alert-metadata.vo';

export type WebhookAlertEntityProps = {
  id?: string;
  endpoint: EndpointEntity;
  user: UserEntity;
  type: string;
  status: string;
  eventType?: string;
  metadata?: AlertMetadataValue;
};

@Entity({ tableName: 'webhook_alerts' })
@Index({ properties: ['user', 'createdAt'] })
@Index({ properties: ['endpoint', 'createdAt'] })
export class WebhookAlertEntity
  extends BaseEntity
  implements WebhookAlertEntityProps
{
  @ManyToOne(() => EndpointEntity, {
    fieldName: 'endpoint_id',
    deleteRule: 'cascade',
  })
  endpoint: EndpointEntity;
  @ManyToOne(() => UserEntity, {
    fieldName: 'user_id',
    deleteRule: 'cascade',
  })
  user: UserEntity;
  @Property({ type: 'text' })
  type: string;
  @Property({ type: 'text' })
  status: string;
  @Property({ type: 'text', nullable: true })
  eventType?: string;
  @Property({ type: 'jsonb', nullable: true })
  metadata?: AlertMetadataValue;

  constructor(props: WebhookAlertEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.endpoint = props.endpoint;
    this.user = props.user;
    this.type = props.type;
    this.status = props.status;
    this.eventType = props.eventType;
    this.metadata = props.metadata;
  }
}
