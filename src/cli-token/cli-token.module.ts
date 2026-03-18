import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '@auth/auth.module';
import { Token } from '@cli-token/constants';
import { CLITokenRepository } from '@cli-token/adapters/outbound/persistence/repositories/cli-token.repository';
import { CLITokenMapper } from '@cli-token/adapters/outbound/persistence/mappers/cli-token.mapper';
import { CLITokenController } from '@cli-token/adapters/inbound/http/controllers/cli-token.controller';
import { DomainExceptionFilter } from '@cli-token/adapters/inbound/http/filters/domain-exception.filter';
import { CreateCLITokenHandler } from '@cli-token/application/commands/create-cli-token/create-cli-token.handler';
import { RotateCLITokenHandler } from '@cli-token/application/commands/rotate-cli-token/rotate-cli-token.handler';
import { GetUserCLITokenHandler } from '@cli-token/application/queries/get-user-cli-token/get-user-cli-token.handler';

const CommandHandlers = [CreateCLITokenHandler, RotateCLITokenHandler];
const QueryHandlers = [GetUserCLITokenHandler];

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [CLITokenController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    CLITokenMapper,
    DomainExceptionFilter,
    {
      provide: Token.CLIToken,
      useClass: CLITokenRepository,
    },
  ],
  exports: [CqrsModule, Token.CLIToken],
})
export class CliTokenModule {}
