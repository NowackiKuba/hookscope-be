import type { UserSettingsPatch } from '@user-settings/domain/aggregates/user-settings';

export class UpdateUserSettingsCommand {
  constructor(
    public readonly payload: {
      userId: string;
      patch: UserSettingsPatch;
    },
  ) {}
}
