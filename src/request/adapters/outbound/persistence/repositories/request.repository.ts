import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { RequestEntity } from '@request/adapters/outbound/persistence/entities/request.entity';
import { RequestMapper } from '@request/adapters/outbound/persistence/mappers/request.mapper';
import type {
  EndpointRequestCount,
  ForwardResult,
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
  private readonly dbSource: EntityRepository<RequestEntity>;
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: RequestMapper,
  ) {
    this.dbSource = this.em.getRepository(RequestEntity);
  }

  async save(request: Request): Promise<Request> {
    const res = this.dbSource.create(this.mapper.toEntity(request));
    this.em.persist(res);
    await this.em.flush();
    return this.mapper.toDomain(res);
  }

  async findById(id: string): Promise<Request | null> {
    const entity = await this.dbSource.findOne(
      { id },
      { populate: ['endpoint'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByEndpointId(
    filters: RequestFilters,
    endpointId: string,
  ): Promise<Page<Request>> {
    const {
      limit = 20,
      offset = 0,
      orderBy = 'desc',
      orderByField = 'receivedAt',
    } = filters;

    const [entities, totalCount] = await this.dbSource.findAndCount(
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
    return this.dbSource.count({
      endpoint: endpointId,
    } as FilterQuery<RequestEntity>);
  }

  async countByUserIdInPeriod(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    return this.dbSource.count({
      endpoint: { user: { id: userId } },
      receivedAt: { $gte: start, $lt: end },
    } as FilterQuery<RequestEntity>);
  }

  async countByEndpointInPeriod(
    start: Date,
    end: Date,
  ): Promise<EndpointRequestCount[]> {
    const em = getEm(this.em);
    const rows = (await em.getConnection().execute(
      `
        SELECT endpoint_id, COUNT(*)::int AS count
        FROM requests
        WHERE received_at >= ? AND received_at < ?
        GROUP BY endpoint_id
      `,
      [start, end],
    )) as Array<{ endpoint_id: string; count: number | string }>;

    return rows.map((row) => ({
      endpointId: row.endpoint_id,
      count:
        typeof row.count === 'number'
          ? row.count
          : Number.parseInt(row.count, 10),
    }));
  }

  async findInPeriod(start: Date, end: Date): Promise<Request[]> {
    const entities = await this.dbSource.find(
      {
        receivedAt: { $gte: start, $lt: end },
      } as FilterQuery<RequestEntity>,
      {
        orderBy: { receivedAt: 'desc' },
        populate: ['endpoint'],
      },
    );

    return entities.map((entity) => this.mapper.toDomain(entity));
  }

  async countThisMonth(endpointId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.dbSource.count({
      endpoint: endpointId,
      receivedAt: { $gte: startOfMonth },
    } as FilterQuery<RequestEntity>);
  }

  async deleteOlderThan(endpointId: string, before: Date): Promise<number> {
    const result = await this.dbSource.nativeDelete({
      endpoint: endpointId,
      receivedAt: { $lt: before },
    } as FilterQuery<RequestEntity>);
    await this.em.flush();
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.dbSource.nativeDelete({ id });
    await this.em.flush();
  }

  async updateForwardResult(id: string, result: ForwardResult): Promise<void> {
    const entity = await this.dbSource.findOne({ id });
    if (!entity) return;
    entity.forwardStatus = result.forwardStatus;
    entity.forwardedAt = result.forwardedAt;
    entity.forwardError = result.forwardError;
    await this.em.flush();
  }

  async findByUserId(
    filters: RequestFilters,
    userId: UserId,
  ): Promise<Page<Request>> {
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

    const [entities, totalCount] = await this.dbSource.findAndCount(where, {
      limit,
      offset,
      orderBy: { [orderByField]: orderBy },
      populate: ['endpoint'],
    });

    const data = entities.map((e) => this.mapper.toDomain(e));
    return paginate(data, { limit, offset, totalCount });
  }

  async findByPayloadHash(
    payloadHash: string,
    requestId: string,
    withinMinutes: number,
  ): Promise<Request[]> {
    const em = getEm(this.em);
    const dbSource = em.getRepository(RequestEntity);

    const currentRequest = await dbSource.findOne(
      { id: requestId },
      { populate: ['endpoint'] },
    );

    if (!currentRequest) {
      return [];
    }

    const since = new Date(Date.now() - withinMinutes * 60 * 1000);

    const entities = await dbSource.find(
      {
        payloadHash,
        id: { $ne: requestId },
        endpoint: { id: currentRequest.endpoint.id },
        receivedAt: { $gte: since },
      } as FilterQuery<RequestEntity>,
      {
        orderBy: { receivedAt: 'desc' },
        limit: 1,
        populate: ['endpoint'],
      },
    );

    return entities.map((entity) => this.mapper.toDomain(entity));
  }
}
