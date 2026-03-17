import { EntityManager } from '@mikro-orm/postgresql';
import { FilterQuery, RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { RetryEntity } from '@retry/adapters/outbound/persistence/entities/retry.entity';
import { RetryMapper } from '@retry/adapters/outbound/persistence/mappers/retry.mapper';
import type {
  RetryFilters,
  RetryRepositoryPort,
} from '@retry/domain/ports/outbound/persistence/repositories/retry.repository.port';
import { Retry } from '@retry/domain/aggregates/retry';
import { RetryStatus } from '@retry/domain/enums/retry-status.enum';
import { Page, paginate } from '@shared/utils/pagination';
import { UserId } from '@users/domain/value-objects/user-id.vo';

function getEm(fallback: EntityManager): EntityManager {
  const ctx = RequestContext.getEntityManager();
  return (ctx ?? fallback) as EntityManager;
}

@Injectable()
export class RetryRepository implements RetryRepositoryPort {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: RetryMapper,
  ) {}

  private getEm(): EntityManager {
    return getEm(this.em);
  }

  private applyDomainToEntity(entity: RetryEntity, retry: Retry): void {
    const json = retry.toJSON();
    // NOTE: id is PrimaryKey, keep as-is; request relation is derived from requestId.
    entity.targetUrl = json.targetUrl;
    entity.status = json.status;
    entity.attemptCount = json.attemptCount;
    entity.lastAttemptAt = json.lastAttemptAt ?? null;
    entity.nextAttemptAt = json.nextAttemptAt ?? null;
    entity.responseStatus = json.responseStatus ?? null;
    entity.responseBody = json.responseBody ?? null;
    entity.customBody = json.customBody;
    entity.customHeaders = json.customHeaders ?? undefined;
    entity.updatedAt = new Date();
  }

  async create(retry: Retry): Promise<void> {
    const em = this.getEm();
    const entity = this.mapper.toEntity(retry);
    await em.persistAndFlush(entity);
  }

  async update(retry: Retry): Promise<void> {
    const em = this.getEm();
    const entity = await em.findOne(RetryEntity, { id: retry.id });
    if (!entity) {
      // If it doesn't exist yet, fall back to create (idempotent-ish save)
      await this.create(retry);
      return;
    }
    this.applyDomainToEntity(entity, retry);
    await em.persistAndFlush(entity);
  }

  async save(retry: Retry): Promise<void> {
    const em = this.getEm();
    const existing = await em.findOne(RetryEntity, { id: retry.id });
    if (!existing) {
      await this.create(retry);
      return;
    }
    this.applyDomainToEntity(existing, retry);
    await em.persistAndFlush(existing);
  }

  async findById(id: string): Promise<Retry | null> {
    const em = this.getEm();
    const entity = await em.findOne(
      RetryEntity,
      { id },
      { populate: ['request'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdAndUserId(id: string, userId: UserId): Promise<Retry | null> {
    const em = this.getEm();
    const entity = await em.findOne(
      RetryEntity,
      {
        id,
        request: {
          endpoint: {
            user: { id: userId.value },
          },
        },
      },
      { populate: ['request'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findPending(limit: number): Promise<Retry[]> {
    const em = this.getEm();
    const now = new Date();
    const list = await em.find(
      RetryEntity,
      { status: RetryStatus.PENDING, nextAttemptAt: { $lte: now } },
      { orderBy: { nextAttemptAt: 'asc' }, limit, populate: ['request'] },
    );
    return list.map((entity) => this.mapper.toDomain(entity));
  }

  async findByRequestId(requestId: string): Promise<Retry> {
    const em = this.getEm();
    const retry = await em.findOne(
      RetryEntity,
      { request: { id: requestId } },
      { populate: ['request'] },
    );
    return this.mapper.toDomain(retry);
  }

  async getByUserId(
    filters: RetryFilters,
    userId: UserId,
  ): Promise<Page<Retry>> {
    const { limit, offset, orderBy, orderByField, requestId, status } = filters;

    const where: FilterQuery<RetryEntity> = {
      request: {
        endpoint: {
          user: { id: userId.value },
        },
      },
    };

    if (status) {
      where.status = status;
    }

    const sortField = orderByField ?? 'createdAt';
    const sortOrder = orderBy ?? 'desc';
    const [retries, totalCount] = await this.em.findAndCount(
      RetryEntity,
      where,
      {
        limit: limit ?? 20,
        offset: offset ?? 0,
        orderBy: { [sortField]: sortOrder },
        populate: ['request'],
      },
    );

    return paginate(
      retries.map((retry) => this.mapper.toDomain(retry)),
      {
        limit: limit ?? 20,
        offset: offset ?? 0,
        totalCount,
      },
    );
  }

  async updateAttempt(
    id: string,
    result: {
      status: RetryStatus.PENDING | RetryStatus.SUCCESS | RetryStatus.FAILED;
      attemptCount: number;
      lastAttemptAt: Date;
      nextAttemptAt: Date | null;
      responseStatus: number | null;
      responseBody: string | null;
    },
  ): Promise<void> {
    const em = this.getEm();
    const entity = await em.findOne(RetryEntity, { id });
    if (!entity) return;
    entity.status = result.status;
    entity.attemptCount = result.attemptCount;
    entity.lastAttemptAt = result.lastAttemptAt;
    entity.nextAttemptAt = result.nextAttemptAt;
    entity.responseStatus = result.responseStatus;
    entity.responseBody = result.responseBody;
    entity.updatedAt = new Date();
    await em.persistAndFlush(entity);
  }

  async cancel(id: string): Promise<void> {
    const em = this.getEm();
    const entity = await em.findOne(RetryEntity, { id });
    if (!entity) return;
    entity.status = RetryStatus.CANCELLED;
    entity.updatedAt = new Date();
    await em.persistAndFlush(entity);
  }
}
