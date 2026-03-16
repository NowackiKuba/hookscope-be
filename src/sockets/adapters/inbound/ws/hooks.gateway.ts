import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { RequestJSON } from '@request/domain/aggregates/request';
import type { SocketsServicePort } from '@sockets/domain/ports/outbound/services/sockets.service.port';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { LoggerProvider } from '@shared/constants';

const ROOM_PREFIX = 'endpoint:';

@WebSocketGateway({ cors: true })
export class HooksGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SocketsServicePort
{
  constructor(
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}
  @WebSocketServer() server!: Server;

  afterInit(): void {
    // Gateway ready for connections
  }

  handleConnection(client: Socket): void {
    // Client must send 'subscribe' with endpointId to join room
  }

  handleDisconnect(client: Socket): void {
    // Socket.io removes client from all rooms automatically
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { endpointId: string }): void {
    const endpointId =
      typeof payload === 'object' && payload && 'endpointId' in payload
        ? String(payload.endpointId)
        : String(payload);
    this.logger.info('SUBSCRIBE WITH ENDPOINT ID', { endpointId });
    if (endpointId) {
      client.join(ROOM_PREFIX + endpointId);
    }
  }

  emitRequest(endpointId: string, payload: RequestJSON): void {
    this.server.to(ROOM_PREFIX + endpointId).emit('request.received', payload);
  }

  emitForwardUpdate(endpointId: string, payload: {
    requestId: string;
    forwardStatus: number;
    forwardError: string | null;
  }): void {
    this.logger.info('EMIT FORWARD UPDATED', {
      endpointId,
      payload,
    });
    this.server
      .to(ROOM_PREFIX + endpointId)
      .emit('forward.updated', payload);
  }
}
