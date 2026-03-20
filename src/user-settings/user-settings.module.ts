import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '@auth/auth.module';
import { CreateUserSettingsHandler } from '@user-settings/application/commands/create-user-settings/create-user-settings.handler';
import { UpdateUserSettingsHandler } from '@user-settings/application/commands/update-user-settings/update-user-settings.handler';
import { GetUserSettingsByUserIdHandler } from '@user-settings/application/queries/get-user-settings-by-user-id/get-user-settings-by-user-id.handler';
import { Token } from '@user-settings/constants';
import { UserSettingsRepository } from '@user-settings/adapters/outbound/persistence/repositories/user-settings.repository';
import { UserSettingsMapper } from '@user-settings/adapters/outbound/persistence/mappers/user-settings.mapper';
import { UserSettingsController } from '@user-settings/adapters/inbound/http/controllers/user-settings.controller';
import { DomainExceptionFilter } from '@user-settings/adapters/inbound/http/filters/domain-exception.filter';

const CommandHandlers = [CreateUserSettingsHandler, UpdateUserSettingsHandler];
const QueryHandlers = [GetUserSettingsByUserIdHandler];

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [UserSettingsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    UserSettingsMapper,
    DomainExceptionFilter,
    {
      provide: Token.UserSettingsRepository,
      useClass: UserSettingsRepository,
    },
  ],
  exports: [CqrsModule, Token.UserSettingsRepository, UserSettingsMapper],
})
export class UserSettingsModule {}
