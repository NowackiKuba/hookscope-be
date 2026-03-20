import { generateUUID } from '@shared/utils/generate-uuid';
import { GenerationTarget } from '@endpoint/domain/value-objects/edpoint-schema-generated.vo';

export type UserSettingsTheme = 'light' | 'dark' | 'system';

export type UserSettingsNotificationChannels = {
  email: boolean;
  slack: boolean;
  discord: boolean;
};

export const DEFAULT_USER_SETTINGS: {
  autoGenerationTargets: GenerationTarget[];
  manualGenerationTargets: GenerationTarget[];
  notificationChannels: UserSettingsNotificationChannels;
  slackWebhookUrl: string | null;
  discordWebhookUrl: string | null;
  defaultSilenceThreshold: number;
  volumeSpikeMultiplier: number;
  language: string;
  theme: UserSettingsTheme;
} = {
  autoGenerationTargets: [GenerationTarget.TS_INTERFACE],
  manualGenerationTargets: [
    GenerationTarget.NESTJS_DTO,
    GenerationTarget.ZOD_SCHEMA,
  ],
  notificationChannels: {
    email: true,
    slack: false,
    discord: false,
  },
  slackWebhookUrl: null,
  discordWebhookUrl: null,
  defaultSilenceThreshold: 1440,
  volumeSpikeMultiplier: 3,
  language: 'en',
  theme: 'system',
};

export type UserSettingsProps = {
  id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserSettingsJSON = {
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
  createdAt: Date;
  updatedAt: Date;
};

export type UserSettingsPatch = Partial<
  Omit<
    UserSettingsProps,
    | 'id'
    | 'userId'
    | 'createdAt'
    | 'updatedAt'
    | 'notificationChannels'
  >
> & {
  notificationChannels?: Partial<UserSettingsNotificationChannels>;
};

export class UserSettings {
  private _id: string;
  private _userId: string;
  private _autoGenerationTargets: GenerationTarget[];
  private _manualGenerationTargets: GenerationTarget[];
  private _notificationChannels: UserSettingsNotificationChannels;
  private _slackWebhookUrl: string | null;
  private _discordWebhookUrl: string | null;
  private _defaultSilenceThreshold: number;
  private _volumeSpikeMultiplier: number;
  private _language: string;
  private _theme: UserSettingsTheme;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: UserSettingsProps) {
    this._id = props.id ?? generateUUID();
    this._userId = props.userId;
    this._autoGenerationTargets = props.autoGenerationTargets;
    this._manualGenerationTargets = props.manualGenerationTargets;
    this._notificationChannels = { ...props.notificationChannels };
    this._slackWebhookUrl = props.slackWebhookUrl;
    this._discordWebhookUrl = props.discordWebhookUrl;
    this._defaultSilenceThreshold = props.defaultSilenceThreshold;
    this._volumeSpikeMultiplier = props.volumeSpikeMultiplier;
    this._language = props.language;
    this._theme = props.theme;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static createDefault(userId: string): UserSettings {
    return new UserSettings({
      userId,
      ...DEFAULT_USER_SETTINGS,
    });
  }

  static reconstitute(props: UserSettingsProps): UserSettings {
    return new UserSettings(props);
  }

  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get autoGenerationTargets(): GenerationTarget[] {
    return [...this._autoGenerationTargets];
  }
  get manualGenerationTargets(): GenerationTarget[] {
    return [...this._manualGenerationTargets];
  }
  get notificationChannels(): UserSettingsNotificationChannels {
    return { ...this._notificationChannels };
  }
  get slackWebhookUrl(): string | null {
    return this._slackWebhookUrl;
  }
  get discordWebhookUrl(): string | null {
    return this._discordWebhookUrl;
  }
  get defaultSilenceThreshold(): number {
    return this._defaultSilenceThreshold;
  }
  get volumeSpikeMultiplier(): number {
    return this._volumeSpikeMultiplier;
  }
  get language(): string {
    return this._language;
  }
  get theme(): UserSettingsTheme {
    return this._theme;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  applyPatch(patch: UserSettingsPatch): void {
    if (patch.autoGenerationTargets !== undefined) {
      this._autoGenerationTargets = [...patch.autoGenerationTargets];
    }
    if (patch.manualGenerationTargets !== undefined) {
      this._manualGenerationTargets = [...patch.manualGenerationTargets];
    }
    if (patch.notificationChannels !== undefined) {
      this._notificationChannels = {
        ...this._notificationChannels,
        ...patch.notificationChannels,
      };
    }
    if (patch.slackWebhookUrl !== undefined) {
      this._slackWebhookUrl = patch.slackWebhookUrl;
    }
    if (patch.discordWebhookUrl !== undefined) {
      this._discordWebhookUrl = patch.discordWebhookUrl;
    }
    if (patch.defaultSilenceThreshold !== undefined) {
      this._defaultSilenceThreshold = patch.defaultSilenceThreshold;
    }
    if (patch.volumeSpikeMultiplier !== undefined) {
      this._volumeSpikeMultiplier = patch.volumeSpikeMultiplier;
    }
    if (patch.language !== undefined) {
      this._language = patch.language;
    }
    if (patch.theme !== undefined) {
      this._theme = patch.theme;
    }
    this._updatedAt = new Date();
  }

  toJSON(): UserSettingsJSON {
    return {
      id: this._id,
      userId: this._userId,
      autoGenerationTargets: [...this._autoGenerationTargets],
      manualGenerationTargets: [...this._manualGenerationTargets],
      notificationChannels: { ...this._notificationChannels },
      slackWebhookUrl: this._slackWebhookUrl,
      discordWebhookUrl: this._discordWebhookUrl,
      defaultSilenceThreshold: this._defaultSilenceThreshold,
      volumeSpikeMultiplier: this._volumeSpikeMultiplier,
      language: this._language,
      theme: this._theme,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
