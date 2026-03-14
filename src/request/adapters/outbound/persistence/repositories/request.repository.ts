import { EntityManager } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { RequestEntity } from '@request/adapters/outbound/persistence/entities/request.entity';
import { RequestMapper } from '@request/adapters/outbound/persistence/mappers/request.mapper';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { Request } from '@request/domain/aggregates/request';

function getEm(fallback: EntityManager): EntityManager {
  const ctx = RequestContext.getEntityManager();
  return (ctx ?? fallback) as EntityManager;
}

@Injectable()
export class RequestRepository implements RequestRepositoryPort {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: RequestMapper,
  ) {}

  private getEm(): EntityManager {
    return getEm(this.em);
  }

  async save(request: Request): Promise<Request> {
    const em = this.getEm();
    const entity = this.mapper.toPersistence(request);
    em.persist(entity);
    await em.flush();
    return this.mapper.toDomain(entity);
  }

  async findById(id: string): Promise<Request | null> {
    const em = this.getEm();
    const entity = await em.findOne(RequestEntity, { id }, { populate: ['endpoint'] });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEndpointId(
    endpointId: string,
    limit: number,
    offset: number,
  ): Promise<Request[]> {
    const em = this.getEm();
    const entities = await em.find(
      RequestEntity,
      { endpoint: endpointId } as FilterQuery<RequestEntity>,
      { orderBy: { receivedAt: 'desc' }, limit, offset, populate: ['endpoint'] },
    );
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByEndpointId(endpointId: string): Promise<number> {
    const em = this.getEm();
    return em.count(RequestEntity, { endpoint: endpointId } as FilterQuery<RequestEntity>);
  }

  async countThisMonth(endpointId: string): Promise<number> {
    const em = this.getEm();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return em.count(RequestEntity, {
      endpoint: endpointId,
      receivedAt: { $gte: startOfMonth },
    } as FilterQuery<RequestEntity>);
  }

  async deleteOlderThan(endpointId: string, before: Date): Promise<number> {
    const em = this.getEm();
    const result = await em.nativeDelete(RequestEntity, {
      endpoint: endpointId,
      receivedAt: { $lt: before },
    } as FilterQuery<RequestEntity>);
    await em.flush();
    return result;
  }

  async delete(id: string): Promise<void> {
    const em = this.getEm();
    await em.nativeDelete(RequestEntity, { id });
    await em.flush();
  }
}
