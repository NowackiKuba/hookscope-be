import { CLITokenRepositoryPort } from '@cli-token/domain/ports/outbound/persistence/repositories/cli-token.repository.port';
import { CLIToken } from '@cli-token/domain/aggregates/cli-token';
import { CLITokenId } from '@cli-token/domain/value-objects/cli-token-id.vo';
import { CLITokenHash } from '@cli-token/domain/value-objects/cli-token-hash.vo';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CLITokenEntity } from '../entities/cli-token.entity';
import { CLITokenMapper } from '../mappers/cli-token.mapper';
import { CLITokenPrefix } from '@cli-token/domain/value-objects/cli-token-prefix.vo';

@Injectable()
export class CLITokenRepository implements CLITokenRepositoryPort {
  private readonly dbSource: EntityRepository<CLITokenEntity>;

  constructor(
    private readonly em: EntityManager,
    private readonly mapper: CLITokenMapper,
  ) {
    this.dbSource = this.em.getRepository(CLITokenEntity);
  }

  async save(token: CLIToken): Promise<CLIToken> {
    const json = token.toJSON();
    const existing = await this.dbSource.findOne(
      { id: json.id },
      { populate: ['user'] },
    );
    if (existing) {
      existing.tokenHash = json.tokenHash;
      existing.prefix = json.prefix;
      existing.lastUsedAt = json.lastUsedAt ?? undefined;
      this.em.persist(existing);
      await this.em.flush();
      return this.mapper.toDomain(existing);
    }
    const entity = this.mapper.toEntity(token);
    this.em.persist(entity);
    await this.em.flush();
    return this.mapper.toDomain(entity);
  }

  async findById(id: CLITokenId): Promise<CLIToken | null> {
    const entity = await this.dbSource.findOne(
      { id: id.value },
      { populate: ['user'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByPrefix(prefix: CLITokenPrefix): Promise<CLIToken | null> {
    const entity = await this.dbSource.findOne(
      { prefix: prefix.value },
      { populate: ['user'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByTokenHash(hash: CLITokenHash): Promise<CLIToken | null> {
    const entity = await this.dbSource.findOne(
      { tokenHash: hash.value },
      { populate: ['user'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<CLIToken | null> {
    const entity = await this.dbSource.findOne(
      { user: userId },
      { populate: ['user'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async delete(id: CLITokenId): Promise<void> {
    await this.dbSource.nativeDelete({ id: id.value });
    await this.em.flush();
  }
}
