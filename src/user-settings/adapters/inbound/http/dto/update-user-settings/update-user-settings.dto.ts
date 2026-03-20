export class UpdateUserSettingsDto {
  autoGenerationTargets?: string[];
  manualGenerationTargets?: string[];
  notificationChannels?: {
    email: boolean;
    slack: boolean;
    discord: boolean;
  };
  slackWebhookUrl?: string | null;
  discordWebhookUrl?: string | null;
  defaultSilenceThreshold?: number;
  volumeSpikeMultiplier?: number;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
}
