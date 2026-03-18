import { EntityManager } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';
import { UserMapper } from '@users/adapters/outbound/persistence/mappers/user.mapper';
import type { UserRepositoryPort } from '@users/domain/ports/outbound/persistence/repositories/user.repository.port';
import { User } from '@users/domain/aggregates/user';
import { UserId } from '@users/domain/value-objects/user-id.vo';
import { Email } from '@users/domain/value-objects/user-email.vo';
import { BaseFilters } from '@shared/domain/types/base-filters.type';
import { Page, paginate } from '@shared/utils/pagination';

function getEm(fallback: EntityManager): EntityManager {
  const ctx = RequestContext.getEntityManager();
  return (ctx ?? fallback) as EntityManager;
}

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: UserMapper,
  ) {}

  private getEm(): EntityManager {
    return getEm(this.em);
  }

  async create(user: User): Promise<User> {
    const em = this.getEm();
    const entity = this.mapper.toPersistence(user);
    em.persist(entity);
    await em.flush();
    return this.mapper.toDomain(entity);
  }

  async update(user: User): Promise<void> {
    const em = this.getEm();
    const entity = await em.findOne(UserEntity, { id: user.id.value });
    if (!entity) return;
    const updated = this.mapper.toPersistence(user);
    entity.firstName = updated.firstName;
    entity.lastName = updated.lastName;
    entity.username = updated.username;
    entity.email = updated.email;
    entity.passwordHash = updated.passwordHash;
    entity.avatarUrl = updated.avatarUrl;
    entity.role = updated.role;
    entity.isActive = updated.isActive;
    entity.resetPasswordToken = updated.resetPasswordToken ?? null;
    entity.resetPasswordTokenExpiresAt =
      updated.resetPasswordTokenExpiresAt ?? null;
    entity.createdBy = updated.createdBy ?? null;
    entity.createdById = updated.createdById ?? null;
    entity.updatedAt = new Date();
    em.persist(entity);
    await em.flush();
  }

  async delete(id: UserId): Promise<void> {
    const em = this.getEm();
    await em.nativeDelete(UserEntity, { id: id.value });
    await em.flush();
  }

  async getById(id: UserId): Promise<User | null> {
    const em = this.getEm();
    const entity = await em.findOne(UserEntity, { id: id.value });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async getByEmail(email: Email): Promise<User | null> {
    const em = this.getEm();
    const entity = await em.findOne(UserEntity, { email: email.value });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async getByResetPasswordToken(token: string): Promise<User | null> {
    const em = this.getEm();
    const entity = await em.findOne(UserEntity, {
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: new Date() },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const em = this.getEm();
    const count = await em.count(UserEntity, { email: email.value });
    return count > 0;
  }

  async getByUsername(username: string): Promise<User> {
    const em = this.getEm();
    const entity = await em.findOne(UserEntity, { username });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async getAll(filters: BaseFilters): Promise<Page<User>> {
    const em = this.getEm();
    const {
      limit = 20,
      offset = 0,
      orderBy = 'asc',
      orderByField = 'createdAt',
    } = filters;
    const [entities, totalCount] = await em.findAndCount(
      UserEntity,
      {},
      {
        limit,
        offset,
        orderBy: { [orderByField]: orderBy },
      },
    );
    const data = entities.map((e) => this.mapper.toDomain(e));
    return paginate(data, { limit, offset, totalCount }) as Page<User>;
  }
}
