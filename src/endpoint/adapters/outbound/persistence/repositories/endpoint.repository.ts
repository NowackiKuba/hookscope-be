import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { EndpointEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint.entity';
import { EndpointMapper } from '@endpoint/adapters/outbound/persistence/mappers/endpoint.mapper';
import type {
  EndpointFilters,
  EndpointRepositoryPort,
} from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Endpoint } from '@endpoint/domain/aggregates/endpoint';
import { Page, paginate } from '@shared/utils/pagination';

@Injectable()
export class EndpointRepository implements EndpointRepositoryPort {
  private readonly dbSource: EntityRepository<EndpointEntity>;
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: EndpointMapper,
  ) {
    this.dbSource = this.em.getRepository(EndpointEntity);
  }

  async save(endpoint: Endpoint): Promise<Endpoint> {
    const json = endpoint.toJSON();
    const existing = await this.dbSource.findOne({ id: json.id });
    if (existing) {
      existing.name = json.name;
      existing.token = json.token;
      existing.schemas = json.schemas;
      existing.lastSchemaAt = json.lastSchemaAt;
      existing.updatedAt = new Date();
      this.em.persist(existing);
      await this.em.flush();
      return this.mapper.toDomain(existing);
    }
    const entity = this.mapper.toEntity(endpoint);
    this.em.persist(entity);
    await this.em.flush();
    return this.mapper.toDomain(entity);
  }

  async findById(id: string): Promise<Endpoint | null> {
    const entity = await this.dbSource.findOne({ id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByToken(token: string): Promise<Endpoint | null> {
    const entity = await this.dbSource.findOne({ token });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAllByUserId(userId: string): Promise<Endpoint[]> {
    const entities = await this.dbSource.find(
      { user: userId } as FilterQuery<EndpointEntity>,
      { orderBy: { createdAt: 'desc' } },
    );
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async countByUserId(userId: string): Promise<number> {
    return this.dbSource.count({
      user: userId,
    } as FilterQuery<EndpointEntity>);
  }

  async incrementRequestCount(id: string, lastRequestAt: Date): Promise<void> {
    const entity = await this.dbSource.findOne({ id });
    if (entity) {
      entity.requestCount += 1;
      entity.lastRequestAt = lastRequestAt;
      entity.updatedAt = new Date();
      await this.em.flush();
    }
  }

  async getAll(filters: EndpointFilters): Promise<Page<Endpoint>> {
    const where: FilterQuery<EndpointEntity> = {};

    const { isActive, limit, offset, orderBy, orderByField, provider } =
      filters;

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    if (provider) {
      where.provider = provider;
    }

    return await this.getPaginated(where, {
      limit,
      offset,
      orderBy,
      orderByField,
    });
  }

  private async getPaginated(
    where: FilterQuery<EndpointEntity>,
    page: {
      limit: number;
      offset: number;
      orderBy: string;
      orderByField: string;
    },
  ): Promise<Page<Endpoint>> {
    const [endpoints, totalCount] = await this.dbSource.findAndCount(where, {
      limit: page.limit,
      offset: page.offset,
      orderBy: { [page.orderByField]: page.orderBy },
    });

    return paginate(
      endpoints.map((endpoint) => this.mapper.toDomain(endpoint)),
      { limit: page.limit, offset: page.offset, totalCount },
    );
  }

  async delete(id: string): Promise<void> {
    await this.dbSource.nativeDelete({ id });
    await this.em.flush();
  }
}
