import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserSettingsCommand } from './update-user-settings.command';
import type { UserSettingsRepositoryPort } from '@user-settings/domain/ports/outbound/persistence/repositories/user-settings.repository.port';
import { Token } from '@user-settings/constants';
import { UserSettingsNotFoundException } from '@user-settings/domain/exceptions/user-settings-not-found.exception';

@CommandHandler(UpdateUserSettingsCommand)
export class UpdateUserSettingsHandler
  implements ICommandHandler<UpdateUserSettingsCommand>
{
  constructor(
    @Inject(Token.UserSettingsRepository)
    private readonly userSettingsRepository: UserSettingsRepositoryPort,
  ) {}

  async execute(command: UpdateUserSettingsCommand): Promise<void> {
    const { userId, patch } = command.payload;
    const current = await this.userSettingsRepository.findByUserId(userId);
    if (!current) {
      throw new UserSettingsNotFoundException(userId);
    }
    current.applyPatch(patch);
    await this.userSettingsRepository.save(current);
  }
}
