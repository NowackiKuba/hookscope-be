import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { RequestEntity } from '@request/adapters/outbound/persistence/entities/request.entity';
import { RetryStatus } from '@retry/domain/enums/retry-status.enum';
import { generateUUID } from '@shared/utils/generate-uuid';

export type RetryEntityProps = {
  id?: string;
  request: RequestEntity;
  targetUrl: string;
  status: RetryStatus;
  attemptCount?: number;
  lastAttemptAt?: Date;
  nextAttemptAt?: Date;
  responseStatus?: number | null;
  responseBody?: string | null;
  customBody?: unknown;
  customHeaders?: Record<string, string>;
};

@Entity({ tableName: 'retries' })
export class RetryEntity extends BaseEntity implements RetryEntityProps {
  @OneToOne(() => RequestEntity, {
    fieldName: 'request_id',
    deleteRule: 'cascade',
  })
  request!: RequestEntity;

  @Property({ type: 'text', fieldName: 'target_url' })
  targetUrl!: string;

  @Property({ type: 'text', default: RetryStatus.PENDING })
  status: RetryStatus = RetryStatus.PENDING;

  @Property({ type: 'int', default: 0, fieldName: 'attempt_count' })
  attemptCount: number = 0;

  @Property({
    type: 'timestamptz',
    nullable: true,
    fieldName: 'last_attempt_at',
  })
  lastAttemptAt: Date | null = null;

  @Property({
    type: 'timestamptz',
    nullable: true,
    fieldName: 'next_attempt_at',
  })
  nextAttemptAt: Date | null = null;

  @Property({ type: 'int', nullable: true, fieldName: 'response_status' })
  responseStatus: number | null = null;

  @Property({ type: 'text', nullable: true, fieldName: 'response_body' })
  responseBody: string | null = null;

  @Property({ type: 'jsonb', nullable: true })
  customBody?: unknown;
  @Property({ type: 'jsonb', nullable: true })
  customHeaders?: Record<string, string>;

  constructor(props: RetryEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.request = props.request;
    this.targetUrl = props.targetUrl;
    this.status = props.status;
    this.attemptCount = props.attemptCount;
    this.lastAttemptAt = props.lastAttemptAt;
    this.nextAttemptAt = props.nextAttemptAt;
    this.responseStatus = props.responseStatus ?? null;
    this.responseBody = props.responseBody;
    this.customBody = props.customBody;
    this.customHeaders = props.customHeaders;
  }
}
