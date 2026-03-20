import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateUserSettingsCommand } from './create-user-settings.command';
import { UserSettings } from '@user-settings/domain/aggregates/user-settings';
import type { UserSettingsRepositoryPort } from '@user-settings/domain/ports/outbound/persistence/repositories/user-settings.repository.port';
import { Token } from '@user-settings/constants';

@CommandHandler(CreateUserSettingsCommand)
export class CreateUserSettingsHandler
  implements ICommandHandler<CreateUserSettingsCommand>
{
  constructor(
    @Inject(Token.UserSettingsRepository)
    private readonly userSettingsRepository: UserSettingsRepositoryPort,
  ) {}

  async execute(command: CreateUserSettingsCommand): Promise<string> {
    const { userId } = command.payload;
    const existing = await this.userSettingsRepository.findByUserId(userId);
    if (existing) {
      return existing.id;
    }
    const settings = UserSettings.createDefault(userId);
    const created = await this.userSettingsRepository.create(settings);
    return created.id;
  }
}
