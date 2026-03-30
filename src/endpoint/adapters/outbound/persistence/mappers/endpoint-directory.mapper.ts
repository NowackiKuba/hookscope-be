import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { EndpointDirectoryEntity } from '../entities/endpoint-directory.entity';
import { EndpointDirectory } from '@endpoint/domain/aggregates/endpoint-directory';
import { EndpointMapper } from './endpoint.mapper';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';

@Injectable()
export class EndpointDirectoryMapper {
  constructor(
    private readonly em: EntityManager,
    private readonly endpointMapper: EndpointMapper,
  ) {}

  toDomain(entity: EndpointDirectoryEntity): EndpointDirectory {
    return EndpointDirectory.reconstitute({
      ...entity,
      userId: entity.user.id,
      endpoints: entity?.endpoints?.isInitialized()
        ? entity.endpoints.map((e) => this.endpointMapper.toDomain(e))
        : [],
    });
  }

  toEntity(domain: EndpointDirectory): EndpointDirectoryEntity {
    const json = domain.toJSON();

    return new EndpointDirectoryEntity({
      ...json,
      user: this.em.getReference(UserEntity, json.userId),
      endpoints: null,
    });
  }
}
