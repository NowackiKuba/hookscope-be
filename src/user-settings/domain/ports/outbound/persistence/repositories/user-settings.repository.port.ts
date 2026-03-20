import { UserSettings } from '@user-settings/domain/aggregates/user-settings';

export type UserSettingsRepositoryPort = {
  create(settings: UserSettings): Promise<UserSettings>;
  findByUserId(userId: string): Promise<UserSettings | null>;
  save(settings: UserSettings): Promise<UserSettings>;
};
