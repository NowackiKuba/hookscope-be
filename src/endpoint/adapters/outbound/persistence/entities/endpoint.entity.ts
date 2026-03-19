import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { generateUUID } from '@shared/utils/generate-uuid';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';

export type EndpointEntityProps = {
  id?: string;
  user: UserEntity;
  name: string;
  description?: string;
  provider?: string;
  token: string;
  isActive?: boolean;
  targetUrl?: string | null;
  webhookUrl: string;
  secretKey?: string | null;
  requestCount?: number;
  lastRequestAt?: Date | null;
  schemas?: Record<string, Record<string, string>>;
  lastSchemaAt?: Date;
};

@Entity({ tableName: 'endpoints' })
export class EndpointEntity extends BaseEntity implements EndpointEntityProps {
  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @Property({ type: 'text' })
  name!: string;

  @Property({ type: 'text', default: '' })
  description: string = '';

  @Property({ type: 'text', unique: true })
  token!: string;

  @Property({ type: 'text' })
  provider: string;

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @Property({ type: 'text', nullable: true, fieldName: 'target_url' })
  targetUrl: string | null = null;

  @Property({ type: 'text', nullable: true, fieldName: 'webhook_url' })
  webhookUrl: string;

  @Property({ type: 'text', nullable: true, fieldName: 'secret_key' })
  secretKey: string | null = null;

  @Property({ type: 'int', default: 0, fieldName: 'request_count' })
  requestCount: number = 0;

  @Property({
    type: 'timestamptz',
    nullable: true,
    fieldName: 'last_request_at',
  })
  lastRequestAt: Date | null = null;

  @Property({ type: 'jsonb', nullable: true })
  schemas?: Record<string, Record<string, string>>;
  @Property({ type: 'timestamptz', nullable: true })
  lastSchemaAt?: Date;

  constructor(props: EndpointEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.name = props.name;
    this.description = props.description ?? '';
    this.token = props.token;
    this.schemas = props.schemas;
    this.lastSchemaAt = props.lastSchemaAt;
    this.provider = props.provider;
    this.isActive = props.isActive ?? true;
    this.targetUrl = props.targetUrl ?? null;
    this.webhookUrl = props.webhookUrl;
    this.secretKey = props.secretKey ?? null;
    this.requestCount = props.requestCount ?? 0;
    this.lastRequestAt = props.lastRequestAt ?? null;
  }
}
