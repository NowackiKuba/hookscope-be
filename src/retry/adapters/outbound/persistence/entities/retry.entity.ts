import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { RequestEntity } from '@request/adapters/outbound/persistence/entities/request.entity';
import { RetryStatus } from '@retry/domain/enums/retry-status.enum';

@Entity({ tableName: 'retries' })
export class RetryEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => RequestEntity, { fieldName: 'request_id', deleteRule: 'cascade' })
  request!: RequestEntity;

  @Property({ type: 'text', fieldName: 'target_url' })
  targetUrl!: string;

  @Property({ type: 'text', default: RetryStatus.PENDING })
  status: RetryStatus = RetryStatus.PENDING;

  @Property({ type: 'int', default: 0, fieldName: 'attempt_count' })
  attemptCount: number = 0;

  @Property({ type: 'timestamptz', nullable: true, fieldName: 'last_attempt_at' })
  lastAttemptAt: Date | null = null;

  @Property({ type: 'timestamptz', nullable: true, fieldName: 'next_attempt_at' })
  nextAttemptAt: Date | null = null;

  @Property({ type: 'int', nullable: true, fieldName: 'response_status' })
  responseStatus: number | null = null;

  @Property({ type: 'text', nullable: true, fieldName: 'response_body' })
  responseBody: string | null = null;

  @Property({ type: 'timestamptz', fieldName: 'created_at', onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ type: 'timestamptz', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;
}
