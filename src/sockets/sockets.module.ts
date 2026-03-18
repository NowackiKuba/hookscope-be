import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RequestModule } from '@request/request.module';
import { Token } from '@sockets/constants';
import { HooksGateway } from '@sockets/adapters/inbound/ws/hooks.gateway';
import { RequestReceivedListener } from '@sockets/application/listeners/request-received.listener';
import { RequestForwardedListener } from '@sockets/application/listeners/request-forwarded.listener';
import { CliGateway } from '@cli-token/adapters/inbound/ws/gateways/cli-token.gateway';
import { CliTokenModule } from '@cli-token/cli-token.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [CqrsModule, RequestModule, CliTokenModule, AuthModule],
  providers: [
    HooksGateway,
    CliGateway,
    RequestReceivedListener,
    RequestForwardedListener,
    {
      provide: Token.SocketsService,
      useExisting: HooksGateway,
    },
  ],
})
export class SocketsModule {}
