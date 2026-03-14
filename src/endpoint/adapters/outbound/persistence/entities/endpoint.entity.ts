import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { generateUUID } from '@shared/utils/generate-uuid';

export type EndpointEntityProps = {
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
};

@Entity({ tableName: 'endpoints' })
export class EndpointEntity extends BaseEntity implements EndpointEntityProps {
  @Property({ type: 'uuid', fieldName: 'user_id' })
  userId!: string;

  @Property({ type: 'text' })
  name!: string;

  @Property({ type: 'text', default: '' })
  description: string = '';

  @Property({ type: 'text', unique: true })
  token!: string;

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @Property({ type: 'text', nullable: true, fieldName: 'target_url' })
  targetUrl: string | null = null;

  @Property({ type: 'text', nullable: true, fieldName: 'secret_key' })
  secretKey: string | null = null;

  @Property({ type: 'int', default: 0, fieldName: 'request_count' })
  requestCount: number = 0;

  @Property({ type: 'timestamptz', nullable: true, fieldName: 'last_request_at' })
  lastRequestAt: Date | null = null;

  constructor(props: EndpointEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.userId = props.userId;
    this.name = props.name;
    this.description = props.description ?? '';
    this.token = props.token;
    this.isActive = props.isActive ?? true;
    this.targetUrl = props.targetUrl ?? null;
    this.secretKey = props.secretKey ?? null;
    this.requestCount = props.requestCount ?? 0;
    this.lastRequestAt = props.lastRequestAt ?? null;
  }
}
