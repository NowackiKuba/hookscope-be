import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { generateUUID } from '@shared/utils/generate-uuid';
import { UserRole } from '@users/domain/enums/user-role.enum';

export type UserEntityProps = {
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  role?: string;
  isActive?: boolean;
  resetPasswordToken?: string | null;
  resetPasswordTokenExpiresAt?: Date | null;
  createdBy?: string | null;
  createdById?: string | null;
};

@Entity({ tableName: 'users' })
export class UserEntity extends BaseEntity implements UserEntityProps {
  @Property({ type: 'text' })
  firstName: string;
  @Property({ type: 'text' })
  lastName: string;
  @Property({ type: 'text' })
  username: string;
  @Property({ type: 'text' })
  email: string;
  @Property({ type: 'text', fieldName: 'password' })
  passwordHash: string;
  @Property({ type: 'text', nullable: true })
  avatarUrl?: string;
  /** Stored as 'USER' | 'ADMIN' in DB; use mapper for UserRole enum. */
  @Property({ type: 'text', default: 'USER' })
  role: string;
  @Property({ type: 'boolean', default: true })
  isActive: boolean;
  @Property({ type: 'text', nullable: true })
  resetPasswordToken?: string | null;
  @Property({ type: 'timestamptz', nullable: true })
  resetPasswordTokenExpiresAt?: Date | null;
  @Property({ type: 'text', nullable: true })
  createdBy?: string | null;
  @Property({ type: 'uuid', nullable: true, fieldName: 'created_by_id' })
  createdById?: string | null;

  constructor(props: UserEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.username = props.username;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.avatarUrl = props.avatarUrl;
    this.role = props.role ? (props.role as string) : 'USER';
    this.isActive = props.isActive ?? true;
    this.resetPasswordToken = props.resetPasswordToken ?? null;
    this.resetPasswordTokenExpiresAt = props.resetPasswordTokenExpiresAt ?? null;
    this.createdBy = props.createdBy ?? null;
    this.createdById = props.createdById ?? null;
  }
}
