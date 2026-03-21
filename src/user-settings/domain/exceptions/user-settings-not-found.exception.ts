import { DomainException } from '@shared/domain/exceptions';

export class UserSettingsNotFoundException extends DomainException {
  constructor(userId?: string) {
    const message = userId
      ? `User settings for user ${userId} not found`
      : 'User settings not found';
    super(message, 'USER_SETTINGS_NOT_FOUND', userId ? { userId } : undefined);
  }
}
