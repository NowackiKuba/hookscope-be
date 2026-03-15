import { EntityManager } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { RequestEntity } from '@request/adapters/outbound/persistence/entities/request.entity';
import { RequestMapper } from '@request/adapters/outbound/persistence/mappers/request.mapper';
import type {
  RequestFilters,
  RequestRepositoryPort,
} from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { Request } from '@request/domain/aggregates/request';
import { Page, paginate } from '@shared/utils/pagination';
import { UserId } from '@users/domain/value-objects/user-id.vo';

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
    const entity = await em.findOne(
      RequestEntity,
      { id },
      { populate: ['endpoint'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEndpointId(
    filters: RequestFilters,
    endpointId: string,
  ): Promise<Page<Request>> {
    const em = this.getEm();
    const {
      limit = 20,
      offset = 0,
      orderBy = 'desc',
      orderByField = 'receivedAt',
    } = filters;

    const [entities, totalCount] = await em.findAndCount(
      RequestEntity,
      { endpoint: endpointId } as FilterQuery<RequestEntity>,
      {
        orderBy: { [orderByField]: orderBy },
        limit,
        offset,
        populate: ['endpoint'],
      },
    );

    const data = entities.map((e) => this.mapper.toDomain(e));
    return paginate(data, { limit, offset, totalCount }) as Page<Request>;
  }

  async countByEndpointId(endpointId: string): Promise<number> {
    const em = this.getEm();
    return em.count(RequestEntity, {
      endpoint: endpointId,
    } as FilterQuery<RequestEntity>);
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

  async findByUserId(
    filters: RequestFilters,
    userId: UserId,
  ): Promise<Page<Request>> {
    const em = this.getEm();

    const {
      endpointId,
      forwardedStatus,
      limit = 20,
      method,
      offset = 0,
      orderBy = 'desc',
      orderByField = 'receivedAt',
      overlimit,
    } = filters;

    const where: FilterQuery<RequestEntity> = {
      endpoint: endpointId
        ? { id: endpointId, user: { id: userId.value } }
        : { user: { id: userId.value } },
    };

    if (forwardedStatus != null) {
      where.forwardStatus = forwardedStatus;
    }

    if (method) {
      where.method = method;
    }

    if (typeof overlimit === 'boolean') {
      where.overlimit = overlimit;
    }

    const [entities, totalCount] = await em.findAndCount(RequestEntity, where, {
      limit,
      offset,
      orderBy: { [orderByField]: orderBy },
      populate: ['endpoint'],
    });

    const data = entities.map((e) => this.mapper.toDomain(e));
    return paginate(data, { limit, offset, totalCount });
  }
}
