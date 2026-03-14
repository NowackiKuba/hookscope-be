import { Entity, Index, Property } from '@mikro-orm/postgresql';
import { BaseEntity } from '../../../../../orm/entities/base.entity';

export type EmailOutboxStatus = 'pending' | 'sent' | 'failed';

export type EmailOutboxEntityProps = {
  id?: string;
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
  status: EmailOutboxStatus;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

@Entity({ tableName: 'email_outbox' })
@Index({ properties: ['status'] })
@Index({ properties: ['createdAt'] })
export class EmailOutboxEntity
  extends BaseEntity
  implements EmailOutboxEntityProps
{
  @Property({ type: 'text' })
  to: string;

  @Property({ type: 'text' })
  subject: string;

  @Property({ type: 'text' })
  template: string;

  @Property({ type: 'jsonb' })
  context: Record<string, unknown>;

  @Property({ type: 'text', default: 'pending' })
  status: EmailOutboxStatus;

  @Property({ type: 'int', default: 0 })
  attempts: number;

  @Property({ type: 'int', default: 5 })
  maxAttempts: number;

  @Property({ type: 'text', nullable: true })
  lastError?: string;

  @Property({ type: 'timestamptz', nullable: true })
  sentAt?: Date;

  constructor(props: EmailOutboxEntityProps) {
    super();
    if (props.id) this.id = props.id;
    this.to = props.to;
    this.subject = props.subject;
    this.template = props.template;
    this.context = props.context ?? {};
    this.status = props.status ?? 'pending';
    this.attempts = props.attempts ?? 0;
    this.maxAttempts = props.maxAttempts ?? 5;
    this.lastError = props.lastError;
    this.sentAt = props.sentAt;
    if (props.createdAt) this.createdAt = props.createdAt;
    if (props.updatedAt) this.updatedAt = props.updatedAt;
  }
}
