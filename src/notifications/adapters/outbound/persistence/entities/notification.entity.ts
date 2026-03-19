import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { generateUUID } from '@shared/utils/generate-uuid';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';

export type NotificationEntityProps = {
  id?: string;
  user: UserEntity;
  channel: string;
  status: string;
  referenceId: string;
  payload: Record<string, unknown>;
  failedReason?: string;
  sentAt?: Date;
};

@Entity({ tableName: 'notifications' })
export class NotificationEntity
  extends BaseEntity
  implements NotificationEntityProps
{
  @ManyToOne(() => UserEntity)
  user: UserEntity;
  @Property({ type: 'text' })
  channel: string;
  @Property({ type: 'text' })
  status: string;
  @Property({ type: 'uuid' })
  referenceId: string;
  @Property({ type: 'jsonb' })
  payload: Record<string, unknown>;
  @Property({ type: 'text', nullable: true })
  failedReason?: string;
  @Property({ type: 'timestamptz', nullable: true })
  sentAt?: Date;

  constructor(props: NotificationEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.channel = props.channel;
    this.status = props.status;
    this.referenceId = props.referenceId;
    this.payload = props.payload;
    this.failedReason = props.failedReason;
    this.sentAt = props.sentAt;
  }
}
