import { EndpointDirectoryRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-directory.repository.port';
import {
  EntityManager,
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { EndpointDirectoryMapper } from '../mappers/endpoint-directory.mapper';
import { EndpointDirectoryEntity } from '../entities/endpoint-directory.entity';
import { EndpointDirectory } from '@endpoint/domain/aggregates/endpoint-directory';
import { EndpointDirectoryId } from '@endpoint/domain/value-objects/endpoint-directory-id.vo';
import { BaseFilters } from '@shared/domain/types/base-filters.type';
import { Page, paginate } from '@shared/utils/pagination';
import { UserId } from '@users/domain/value-objects/user-id.vo';

@Injectable()
export class EndpointDirectoryRepository implements EndpointDirectoryRepositoryPort {
  private readonly dbSource: EntityRepository<EndpointDirectoryEntity>;
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: EndpointDirectoryMapper,
  ) {
    this.dbSource = this.em.getRepository(EndpointDirectoryEntity);
  }

  async create(
    endpointDirectory: EndpointDirectory,
  ): Promise<EndpointDirectory> {
    const res = this.dbSource.create(this.mapper.toEntity(endpointDirectory));

    this.em.persist(res);

    await this.em.flush();

    return this.mapper.toDomain(res);
  }

  async delete(id: EndpointDirectoryId): Promise<void> {
    await this.dbSource.nativeDelete({ id: id.value });
  }

  async getById(id: EndpointDirectoryId): Promise<EndpointDirectory | null> {
    const dir = await this.dbSource.findOne({ id: id.value });

    return dir ? this.mapper.toDomain(dir) : null;
  }

  async getByUserId(
    userId: UserId,
    filters: BaseFilters,
  ): Promise<Page<EndpointDirectory>> {
    const where: FilterQuery<EndpointDirectoryEntity> = {
      user: { id: userId.value },
    };

    const { limit, offset, orderBy, orderByField } = filters;

    const [directories, totalCount] = await this.dbSource.findAndCount(where, {
      limit,
      offset,
      orderBy: { [orderByField ?? 'createdAt']: orderBy ?? 'desc' },
      populate: ['endpoints'],
    });

    return paginate(
      directories.map((dir) => this.mapper.toDomain(dir)),
      { limit, offset, totalCount },
    );
  }

  async update(endpointDirectory: EndpointDirectory): Promise<void> {
    await this.dbSource.nativeUpdate(
      { id: endpointDirectory.id.value },
      this.mapper.toEntity(endpointDirectory),
    );
  }
}
