import { Entity, OneToOne, Property } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { generateUUID } from '@shared/utils/generate-uuid';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';
import { GenerationTarget } from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';
import type {
  UserSettingsNotificationChannels,
  UserSettingsTheme,
} from '@user-settings/domain/aggregates/user-settings';

export type UserSettingsEntityProps = {
  id?: string;
  user: UserEntity;
  autoGenerationTargets: GenerationTarget[];
  manualGenerationTargets: GenerationTarget[];
  notificationChannels: UserSettingsNotificationChannels;
  slackWebhookUrl: string | null;
  discordWebhookUrl: string | null;
  defaultSilenceThreshold: number;
  volumeSpikeMultiplier: number;
  language: string;
  theme: UserSettingsTheme;
};

@Entity({ tableName: 'user_settings' })
export class UserSettingsEntity
  extends BaseEntity
  implements UserSettingsEntityProps
{
  @OneToOne(() => UserEntity, {
    fieldName: 'user_id',
    deleteRule: 'cascade',
  })
  user!: UserEntity;

  @Property({ type: 'jsonb', fieldName: 'auto_generation_targets' })
  autoGenerationTargets!: GenerationTarget[];

  @Property({ type: 'jsonb', fieldName: 'manual_generation_targets' })
  manualGenerationTargets!: GenerationTarget[];

  @Property({ type: 'jsonb', fieldName: 'notification_channels' })
  notificationChannels!: UserSettingsNotificationChannels;

  @Property({
    type: 'text',
    nullable: true,
    fieldName: 'slack_webhook_url',
  })
  slackWebhookUrl: string | null = null;

  @Property({
    type: 'text',
    nullable: true,
    fieldName: 'discord_webhook_url',
  })
  discordWebhookUrl: string | null = null;

  @Property({
    type: 'int',
    fieldName: 'default_silence_threshold',
  })
  defaultSilenceThreshold!: number;

  @Property({
    type: 'float',
    fieldName: 'volume_spike_multiplier',
  })
  volumeSpikeMultiplier!: number;

  @Property({ type: 'text' })
  language!: string;

  @Property({ type: 'text' })
  theme!: UserSettingsTheme;

  constructor(props: UserSettingsEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.autoGenerationTargets = props.autoGenerationTargets;
    this.manualGenerationTargets = props.manualGenerationTargets;
    this.notificationChannels = props.notificationChannels;
    this.slackWebhookUrl = props.slackWebhookUrl ?? null;
    this.discordWebhookUrl = props.discordWebhookUrl ?? null;
    this.defaultSilenceThreshold = props.defaultSilenceThreshold;
    this.volumeSpikeMultiplier = props.volumeSpikeMultiplier;
    this.language = props.language;
    this.theme = props.theme;
  }
}
