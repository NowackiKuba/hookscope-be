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
    this.logger.info('WS CLIENT CONNECTED', {
      socketId: client.id,
      rooms: Array.from(client.rooms.values()),
    });
  }

  handleDisconnect(client: Socket): void {
    this.logger.info('WS CLIENT DISCONNECTED', {
      socketId: client.id,
    });
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { endpointId: string }): void {
    const endpointId =
      typeof payload === 'object' && payload && 'endpointId' in payload
        ? String(payload.endpointId)
        : String(payload);
    this.logger.info('SUBSCRIBE WITH ENDPOINT ID', {
      endpointId,
      socketId: client.id,
    });
    if (endpointId) {
      const room = ROOM_PREFIX + endpointId;
      client.join(room);
      this.logger.info('CLIENT JOINED ROOM', {
        socketId: client.id,
        room,
        rooms: Array.from(client.rooms.values()),
      });
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
    const room = ROOM_PREFIX + endpointId;
    const socketsInRoom = this.server.sockets.adapter.rooms.get(room);
    this.logger.info('EMIT FORWARD UPDATED ROOM STATE', {
      endpointId,
      room,
      socketsInRoomCount: socketsInRoom ? socketsInRoom.size : 0,
    });
    this.logger.info('EMIT FORWARD UPDATED', {
      endpointId,
      payload,
    });
    this.server.to(room).emit('forward.updated', payload);
  }
}
