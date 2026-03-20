import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import type { FilterQuery } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { UserSettingsEntity } from '@user-settings/adapters/outbound/persistence/entities/user-settings.entity';
import { UserSettingsMapper } from '@user-settings/adapters/outbound/persistence/mappers/user-settings.mapper';
import type { UserSettingsRepositoryPort } from '@user-settings/domain/ports/outbound/persistence/repositories/user-settings.repository.port';
import { UserSettings } from '@user-settings/domain/aggregates/user-settings';

@Injectable()
export class UserSettingsRepository implements UserSettingsRepositoryPort {
  private readonly dbSource: EntityRepository<UserSettingsEntity>;

  constructor(
    private readonly em: EntityManager,
    private readonly mapper: UserSettingsMapper,
  ) {
    this.dbSource = this.em.getRepository(UserSettingsEntity);
  }

  async create(settings: UserSettings): Promise<UserSettings> {
    const entity = this.mapper.toEntity(settings);
    this.em.persist(entity);
    await this.em.flush();
    await this.em.populate(entity, ['user']);
    return this.mapper.toDomain(entity);
  }

  async findByUserId(userId: string): Promise<UserSettings | null> {
    const entity = await this.dbSource.findOne(
      { user: userId } as FilterQuery<UserSettingsEntity>,
      { populate: ['user'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(settings: UserSettings): Promise<UserSettings> {
    const json = settings.toJSON();
    const entity = await this.dbSource.findOne(
      { user: json.userId } as FilterQuery<UserSettingsEntity>,
      { populate: ['user'] },
    );
    if (!entity) {
      const created = this.mapper.toEntity(settings);
      this.em.persist(created);
      await this.em.flush();
      await this.em.populate(created, ['user']);
      return this.mapper.toDomain(created);
    }
    entity.autoGenerationTargets = json.autoGenerationTargets;
    entity.manualGenerationTargets = json.manualGenerationTargets;
    entity.notificationChannels = json.notificationChannels;
    entity.slackWebhookUrl = json.slackWebhookUrl;
    entity.discordWebhookUrl = json.discordWebhookUrl;
    entity.defaultSilenceThreshold = json.defaultSilenceThreshold;
    entity.volumeSpikeMultiplier = json.volumeSpikeMultiplier;
    entity.language = json.language;
    entity.theme = json.theme;
    entity.updatedAt = new Date();
    await this.em.flush();
    return this.mapper.toDomain(entity);
  }
}
