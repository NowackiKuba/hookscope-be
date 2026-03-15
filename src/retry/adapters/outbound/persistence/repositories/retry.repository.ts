import { EntityManager } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { RetryEntity } from '@retry/adapters/outbound/persistence/entities/retry.entity';
import { RetryMapper } from '@retry/adapters/outbound/persistence/mappers/retry.mapper';
import type { RetryRepositoryPort } from '@retry/domain/ports/outbound/persistence/repositories/retry.repository.port';
import { Retry } from '@retry/domain/aggregates/retry';
import { RetryStatus } from '@retry/domain/enums/retry-status.enum';

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

  async save(retry: Retry): Promise<void> {
    const em = this.getEm();
    const entity = this.mapper.toPersistence(retry, em);
    await em.persistAndFlush(entity);
  }

  async findById(id: string): Promise<Retry | null> {
    const em = this.getEm();
    const entity = await em.findOne(RetryEntity, { id }, { populate: ['request'] });
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

  async findByRequestId(requestId: string): Promise<Retry[]> {
    const em = this.getEm();
    const list = await em.find(
      RetryEntity,
      { request: requestId },
      { populate: ['request'] },
    );
    return list.map((entity) => this.mapper.toDomain(entity));
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
