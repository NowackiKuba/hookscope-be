import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserHandler } from '@users/application/commands/create-user/create-user.handler';
import { UpdateUserHandler } from '@users/application/commands/update-user/update-user.handler';
import { GetUserHandler } from '@users/application/queries/get-user/get-user.handler';
import { UserMapper } from '@users/adapters/outbound/persistence/mappers/user.mapper';
import { UserRepository } from '@users/adapters/outbound/persistence/repositories/user.repository';
import { Token } from '@users/constants';

const CommandHandlers = [CreateUserHandler, UpdateUserHandler];
const QueryHandlers = [GetUserHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    UserMapper,
    {
      provide: Token.UserRepository,
      useClass: UserRepository,
    },
  ],
  exports: [CqrsModule, Token.UserRepository, UserMapper],
})
export class UsersModule {}
