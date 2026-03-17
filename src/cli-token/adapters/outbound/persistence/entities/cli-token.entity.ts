import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { generateUUID } from '@shared/utils/generate-uuid';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';

export type CLITokenEntityProps = {
  id?: string;
  user: UserEntity;
  tokenHash: string;
  prefix: string;
  lastUsedAt?: Date;
};

@Entity({ tableName: 'cli_tokens' })
export class CLITokenEntity extends BaseEntity implements CLITokenEntityProps {
  @OneToOne(() => UserEntity)
  user: UserEntity;
  @Property({ type: 'text', unique: true })
  tokenHash: string;
  @Property({ type: 'text' })
  prefix: string;
  @Property({ type: 'timestamptz', nullable: true })
  lastUsedAt?: Date;

  constructor(props: CLITokenEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.tokenHash = props.tokenHash;
    this.prefix = props.prefix;
    this.lastUsedAt = props.lastUsedAt;
  }
}
