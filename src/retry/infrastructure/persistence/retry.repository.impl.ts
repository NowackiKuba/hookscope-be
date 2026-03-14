import { EntityManager } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { RetryEntity } from './retry.orm-entity';
import { RequestEntity } from '@request/adapters/outbound/persistence/entities/request.entity';
import type { RetryRepository } from '@retry/domain/retry.repository';
import { Retry, type RetryStatus } from '@retry/domain/retry.entity';

function getEm(fallback: EntityManager): EntityManager {
  const ctx = RequestContext.getEntityManager();
  return (ctx ?? fallback) as EntityManager;
}

@Injectable()
export class RetryRepositoryImpl implements RetryRepository {
  constructor(private readonly em: EntityManager) {}

  private getEm(): EntityManager {
    return getEm(this.em);
  }

  toDomain(orm: RetryEntity): Retry {
    const requestId = orm.request?.id;
    if (!requestId) {
      throw new Error('RetryEntity must have request populated');
    }
    return new Retry(
      orm.id,
      requestId,
      orm.targetUrl,
      orm.status as RetryStatus,
      orm.attemptCount,
      orm.lastAttemptAt,
      orm.nextAttemptAt,
      orm.responseStatus,
      orm.responseBody,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  toOrm(domain: Retry): RetryEntity {
    const em = this.getEm();
    const requestRef = em.getReference(RequestEntity, domain.requestId);
    const entity = new RetryEntity();
    entity.id = domain.id;
    entity.request = requestRef;
    entity.targetUrl = domain.targetUrl;
    entity.status = domain.status;
    entity.attemptCount = domain.attemptCount;
    entity.lastAttemptAt = domain.lastAttemptAt;
    entity.nextAttemptAt = domain.nextAttemptAt;
    entity.responseStatus = domain.responseStatus;
    entity.responseBody = domain.responseBody;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  async save(retry: Retry): Promise<void> {
    const em = this.getEm();
    const entity = this.toOrm(retry);
    await em.persistAndFlush(entity);
  }

  async findById(id: string): Promise<Retry | null> {
    const em = this.getEm();
    const orm = await em.findOne(RetryEntity, { id }, { populate: ['request'] });
    return orm ? this.toDomain(orm) : null;
  }

  async findPending(limit: number): Promise<Retry[]> {
    const em = this.getEm();
    const now = new Date();
    const list = await em.find(
      RetryEntity,
      { status: 'pending', nextAttemptAt: { $lte: now } },
      { orderBy: { nextAttemptAt: 'asc' }, limit, populate: ['request'] },
    );
    return list.map((orm) => this.toDomain(orm));
  }

  async findByRequestId(requestId: string): Promise<Retry[]> {
    const em = this.getEm();
    const list = await em.find(
      RetryEntity,
      { request: requestId },
      { populate: ['request'] },
    );
    return list.map((orm) => this.toDomain(orm));
  }

  async updateAttempt(
    id: string,
    result: {
      status: 'pending' | 'success' | 'failed';
      attemptCount: number;
      lastAttemptAt: Date;
      nextAttemptAt: Date | null;
      responseStatus: number | null;
      responseBody: string | null;
    },
  ): Promise<void> {
    const em = this.getEm();
    const orm = await em.findOne(RetryEntity, { id });
    if (!orm) return;
    orm.status = result.status;
    orm.attemptCount = result.attemptCount;
    orm.lastAttemptAt = result.lastAttemptAt;
    orm.nextAttemptAt = result.nextAttemptAt;
    orm.responseStatus = result.responseStatus;
    orm.responseBody = result.responseBody;
    orm.updatedAt = new Date();
    await em.persistAndFlush(orm);
  }

  async cancel(id: string): Promise<void> {
    const em = this.getEm();
    const orm = await em.findOne(RetryEntity, { id });
    if (!orm) return;
    orm.status = 'cancelled';
    orm.updatedAt = new Date();
    await em.persistAndFlush(orm);
  }
}
