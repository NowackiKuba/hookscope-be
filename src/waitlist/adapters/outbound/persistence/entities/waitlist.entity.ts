import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { generateUUID } from '@shared/utils/generate-uuid';

export type WaitlistEntityProps = {
  id?: string;
  email: string;
  source?: string;
  notifiedAt?: Date | null;
};

@Entity({ tableName: 'waitlists' })
export class WaitlistEntity extends BaseEntity implements WaitlistEntityProps {
  @Property({ type: 'text', unique: true })
  email: string;
  @Property({ type: 'text', nullable: true })
  source?: string;
  @Property({ type: 'timestamptz', nullable: true })
  notifiedAt?: Date | null;

  constructor(props: WaitlistEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.email = props.email;
    this.source = props.source;
    this.notifiedAt = props.notifiedAt;
  }
}
