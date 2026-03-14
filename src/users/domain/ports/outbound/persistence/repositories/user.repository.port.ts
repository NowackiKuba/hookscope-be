import { BaseFilters } from '@shared/domain/types/base-filters.type';
import { Page } from '@shared/utils/pagination';
import { User } from '@users/domain/aggregates/user';
import { Email } from '@users/domain/value-objects/user-email.vo';
import { UserId } from '@users/domain/value-objects/user-id.vo';

export interface UserRepositoryPort {
  create(user: User): Promise<User>;
  update(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
  getById(id: UserId): Promise<User | null>;
  getByEmail(email: Email): Promise<User | null>;
  getByResetPasswordToken(token: string): Promise<User | null>;
  existsByEmail(email: Email): Promise<boolean>;
  getAll(filters: BaseFilters): Promise<Page<User>>;
}
