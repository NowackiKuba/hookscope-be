import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RequestModule } from '@request/request.module';
import { Token } from '@sockets/constants';
import { HooksGateway } from '@sockets/adapters/inbound/ws/hooks.gateway';
import { RequestReceivedListener } from '@sockets/application/listeners/request-received.listener';

@Module({
  imports: [CqrsModule, RequestModule],
  providers: [
    HooksGateway,
    RequestReceivedListener,
    {
      provide: Token.SocketsService,
      useExisting: HooksGateway,
    },
  ],
})
export class SocketsModule {}
