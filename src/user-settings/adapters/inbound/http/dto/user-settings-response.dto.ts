import type { GenerationTarget } from '@endpoint/domain/value-objects/edpoint-schema-generated.vo';
import type {
  UserSettingsNotificationChannels,
  UserSettingsTheme,
} from '@user-settings/domain/aggregates/user-settings';

export type UserSettingsResponseDto = {
  id: string;
  userId: string;
  autoGenerationTargets: GenerationTarget[];
  manualGenerationTargets: GenerationTarget[];
  notificationChannels: UserSettingsNotificationChannels;
  slackWebhookUrl: string | null;
  discordWebhookUrl: string | null;
  defaultSilenceThreshold: number;
  volumeSpikeMultiplier: number;
  language: string;
  theme: UserSettingsTheme;
  createdAt: string;
  updatedAt: string;
};
