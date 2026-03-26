import { forwardRef, Module } from '@nestjs/common';
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
import { SocketsModule } from '@sockets/sockets.module';
import { CLI_SOCKETS_SERVICE } from '@sockets/domain/ports/outbound/services/cli-sockets.service.port';
import { CliGateway } from '@cli-token/adapters/inbound/ws/gateways/cli-token.gateway';
import { RequestModule } from '@request/request.module';

const CommandHandlers = [CreateCLITokenHandler, RotateCLITokenHandler];
const QueryHandlers = [GetUserCLITokenHandler];

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    forwardRef(() => SocketsModule),
    RequestModule,
  ],
  controllers: [CLITokenController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    CLITokenMapper,
    DomainExceptionFilter,
    CliGateway,
    {
      provide: Token.CLIToken,
      useClass: CLITokenRepository,
    },
    {
      provide: CLI_SOCKETS_SERVICE,
      useExisting: CliGateway,
    },
  ],
  exports: [CqrsModule, Token.CLIToken, CLI_SOCKETS_SERVICE],
})
export class CliTokenModule {}
