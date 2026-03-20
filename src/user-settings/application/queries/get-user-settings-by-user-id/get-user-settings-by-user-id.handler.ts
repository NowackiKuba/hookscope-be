import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserSettingsByUserIdQuery } from './get-user-settings-by-user-id.query';
import type { UserSettingsRepositoryPort } from '@user-settings/domain/ports/outbound/persistence/repositories/user-settings.repository.port';
import { Token } from '@user-settings/constants';
import { UserSettings } from '@user-settings/domain/aggregates/user-settings';
import { UserSettingsNotFoundException } from '@user-settings/domain/exceptions/user-settings-not-found.exception';

@QueryHandler(GetUserSettingsByUserIdQuery)
export class GetUserSettingsByUserIdHandler
  implements IQueryHandler<GetUserSettingsByUserIdQuery>
{
  constructor(
    @Inject(Token.UserSettingsRepository)
    private readonly userSettingsRepository: UserSettingsRepositoryPort,
  ) {}

  async execute(query: GetUserSettingsByUserIdQuery): Promise<UserSettings> {
    const settings = await this.userSettingsRepository.findByUserId(
      query.payload.userId,
    );
    if (!settings) {
      throw new UserSettingsNotFoundException(query.payload.userId);
    }
    return settings;
  }
}
