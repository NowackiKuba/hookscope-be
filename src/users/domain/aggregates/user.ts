import { generateUUID } from '@shared/utils/generate-uuid';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../value-objects/user-email.vo';
import { UserRole } from '../enums/user-role.enum';

export type UserProps = {
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  role?: UserRole;
  isActive?: boolean;
  resetPasswordToken?: string | null;
  resetPasswordTokenExpiresAt?: Date | null;
  createdBy?: string | null;
  createdById?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserJSON = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  resetPasswordToken: string | null;
  resetPasswordTokenExpiresAt: Date | null;
  createdBy: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  private _id: UserId;
  private _firstName: string;
  private _lastName: string;
  private _username: string;
  private _email: Email;
  private _passwordHash: string;
  private _avatarUrl?: string;
  private _role: UserRole;
  private _isActive: boolean;
  private _resetPasswordToken: string | null;
  private _resetPasswordTokenExpiresAt: Date | null;
  private _createdBy: string | null;
  private _createdById: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: UserProps) {
    this._id = UserId.create(props.id ?? generateUUID());
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._username = props.username;
    this._email = Email.create(props.email);
    this._passwordHash = props.passwordHash;
    this._avatarUrl = props.avatarUrl;
    this._role = props.role ?? UserRole.USER;
    this._isActive = props.isActive ?? true;
    this._resetPasswordToken = props.resetPasswordToken ?? null;
    this._resetPasswordTokenExpiresAt =
      props.resetPasswordTokenExpiresAt ?? null;
    this._createdBy = props.createdBy ?? null;
    this._createdById = props.createdById ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: UserProps): User {
    return new User(props);
  }

  get id(): UserId {
    return this._id;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get username(): string {
    return this._username;
  }
  get email(): Email {
    return this._email;
  }
  get passwordHash(): string {
    return this._passwordHash;
  }
  /** Alias for auth handlers that expect user.password */
  get password(): string {
    return this._passwordHash;
  }
  get avatarUrl(): string {
    return this._avatarUrl;
  }
  get role(): UserRole {
    return this._role;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get resetPasswordToken(): string | null {
    return this._resetPasswordToken;
  }
  get resetPasswordTokenExpiresAt(): Date | null {
    return this._resetPasswordTokenExpiresAt;
  }
  get createdBy(): string | null {
    return this._createdBy;
  }
  get createdById(): string | null {
    return this._createdById;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  setActive(): void {
    this._isActive = true;
  }

  updatePassword(hashedPassword: string): void {
    this._passwordHash = hashedPassword;
    this._updatedAt = new Date();
  }

  onForgotPassword(token: string, expiresAt: Date): void {
    this._resetPasswordToken = token;
    this._resetPasswordTokenExpiresAt = expiresAt;
    this._updatedAt = new Date();
  }

  clearResetPasswordToken(): void {
    this._resetPasswordToken = null;
    this._resetPasswordTokenExpiresAt = null;
    this._updatedAt = new Date();
  }

  update(props: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    username?: string;
  }): void {
    let updated = false;

    if (typeof props.firstName === 'string') {
      this._firstName = props.firstName;
      updated = true;
    }
    if (typeof props.lastName === 'string') {
      this._lastName = props.lastName;
      updated = true;
    }
    if (typeof props.avatarUrl === 'string') {
      this._avatarUrl = props.avatarUrl;
      updated = true;
    }
    if (typeof props.username === 'string') {
      this._username = props.username;
      updated = true;
    }

    if (updated) {
      this._updatedAt = new Date();
    }
  }

  toJSON(): UserJSON {
    return {
      id: this._id.value,
      firstName: this._firstName,
      lastName: this._lastName,
      username: this._username,
      email: this._email.value,
      passwordHash: this._passwordHash,
      avatarUrl: this._avatarUrl,
      role: this._role,
      isActive: this._isActive,
      resetPasswordToken: this._resetPasswordToken,
      resetPasswordTokenExpiresAt: this._resetPasswordTokenExpiresAt,
      createdBy: this._createdBy,
      createdById: this._createdById,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
