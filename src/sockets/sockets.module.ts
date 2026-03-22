import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RequestModule } from '@request/request.module';
import { Token } from '@sockets/constants';
import { HooksGateway } from '@sockets/adapters/inbound/ws/hooks.gateway';
import { RequestReceivedListener } from '@sockets/application/listeners/request-received.listener';
import { RequestForwardedListener } from '@sockets/application/listeners/request-forwarded.listener';
import { CliTokenModule } from '@cli-token/cli-token.module';
import { AuthModule } from '@auth/auth.module';
@Module({
  imports: [
    CqrsModule,
    RequestModule,
    forwardRef(() => CliTokenModule),
    AuthModule,
  ],
  providers: [
    HooksGateway,
    RequestReceivedListener,
    RequestForwardedListener,
    {
      provide: Token.SocketsService,
      useExisting: HooksGateway,
    },
  ],
  exports: [Token.SocketsService],
})
export class SocketsModule {}
