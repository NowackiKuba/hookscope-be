import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';
import { UserSettings } from '@user-settings/domain/aggregates/user-settings';
import { UserSettingsEntity } from '@user-settings/adapters/outbound/persistence/entities/user-settings.entity';

@Injectable()
export class UserSettingsMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: UserSettingsEntity): UserSettings {
    return UserSettings.reconstitute({
      id: entity.id,
      userId: entity.user.id,
      autoGenerationTargets: [...entity.autoGenerationTargets],
      manualGenerationTargets: [...entity.manualGenerationTargets],
      notificationChannels: { ...entity.notificationChannels },
      slackWebhookUrl: entity.slackWebhookUrl,
      discordWebhookUrl: entity.discordWebhookUrl,
      defaultSilenceThreshold: entity.defaultSilenceThreshold,
      volumeSpikeMultiplier: entity.volumeSpikeMultiplier,
      language: entity.language,
      theme: entity.theme,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toEntity(settings: UserSettings): UserSettingsEntity {
    const json = settings.toJSON();
    return new UserSettingsEntity({
      id: json.id,
      user: this.em.getReference(UserEntity, json.userId),
      autoGenerationTargets: json.autoGenerationTargets,
      manualGenerationTargets: json.manualGenerationTargets,
      notificationChannels: json.notificationChannels,
      slackWebhookUrl: json.slackWebhookUrl,
      discordWebhookUrl: json.discordWebhookUrl,
      defaultSilenceThreshold: json.defaultSilenceThreshold,
      volumeSpikeMultiplier: json.volumeSpikeMultiplier,
      language: json.language,
      theme: json.theme,
    });
  }
}
