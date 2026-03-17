import { EntityManager } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { EndpointEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint.entity';
import { EndpointMapper } from '@endpoint/adapters/outbound/persistence/mappers/endpoint.mapper';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Endpoint } from '@endpoint/domain/aggregates/endpoint';

function getEm(fallback: EntityManager): EntityManager {
  const ctx = RequestContext.getEntityManager();
  return (ctx ?? fallback) as EntityManager;
}

@Injectable()
export class EndpointRepository implements EndpointRepositoryPort {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: EndpointMapper,
  ) {}

  private getEm(): EntityManager {
    return getEm(this.em);
  }

  async save(endpoint: Endpoint): Promise<Endpoint> {
    const em = this.getEm();
    const json = endpoint.toJSON();
    const existing = await em.findOne(EndpointEntity, { id: json.id });
    if (existing) {
      existing.name = json.name;
      existing.token = json.token;
      existing.updatedAt = new Date();
      em.persist(existing);
      await em.flush();
      return this.mapper.toDomain(existing);
    }
    const entity = this.mapper.toPersistence(endpoint);
    em.persist(entity);
    await em.flush();
    return this.mapper.toDomain(entity);
  }

  async findById(id: string): Promise<Endpoint | null> {
    const em = this.getEm();
    const entity = await em.findOne(EndpointEntity, { id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByToken(token: string): Promise<Endpoint | null> {
    const em = this.getEm();
    const entity = await em.findOne(EndpointEntity, { token });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAllByUserId(userId: string): Promise<Endpoint[]> {
    const em = this.getEm();
    const entities = await em.find(
      EndpointEntity,
      { user: userId } as FilterQuery<EndpointEntity>,
      { orderBy: { createdAt: 'desc' } },
    );
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByUserId(userId: string): Promise<number> {
    const em = this.getEm();
    return em.count(
      EndpointEntity,
      { user: userId } as FilterQuery<EndpointEntity>,
    );
  }

  async incrementRequestCount(id: string, lastRequestAt: Date): Promise<void> {
    const em = this.getEm();
    const entity = await em.findOne(EndpointEntity, { id });
    if (entity) {
      entity.requestCount += 1;
      entity.lastRequestAt = lastRequestAt;
      entity.updatedAt = new Date();
      await em.flush();
    }
  }

  async delete(id: string): Promise<void> {
    const em = this.getEm();
    await em.nativeDelete(EndpointEntity, { id });
    await em.flush();
  }
}
