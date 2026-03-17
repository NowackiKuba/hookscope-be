import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CLITokenEntity } from '../entities/cli-token.entity';
import { CLIToken } from '@cli-token/domain/aggregates/cli-token';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';

@Injectable()
export class CLITokenMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: CLITokenEntity): CLIToken {
    return CLIToken.create({
      ...entity,
      userId: entity.user.id,
    });
  }

  toEntity(domain: CLIToken): CLITokenEntity {
    const domainJSON = domain.toJSON();

    return new CLITokenEntity({
      ...domainJSON,
      user: this.em.getReference(UserEntity, domainJSON.userId),
    });
  }
}
