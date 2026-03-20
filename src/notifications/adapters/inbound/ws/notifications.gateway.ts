import { Inject } from '@nestjs/common';
import { LoggerProvider } from '@shared/constants';
import type { Logger } from 'winston';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { NotificationJSON } from '@notifications/domain/aggregates/notification';
import type { NotificationSocketsServicePort } from '@notifications/domain/ports/outbound/services/notification-sockets.service.port';

const SOCKET_PREFIX = 'app:user:';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    NotificationSocketsServicePort
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
    this.logger.info('NOTIFICATIONS WS CLIENT CONNECTED', {
      socketId: client.id,
      rooms: Array.from(client.rooms.values()),
    });
  }

  handleDisconnect(client: Socket): void {
    this.logger.info('NOTIFICATIONS WS CLIENT DISCONNECTED', {
      socketId: client.id,
    });
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, payload: { userId: string }): void {
    const userId =
      typeof payload === 'object' && payload && 'userId' in payload
        ? String(payload.userId)
        : String(payload);

    if (!userId) {
      return;
    }

    const room = SOCKET_PREFIX + userId;
    client.join(room);
    this.logger.info('NOTIFICATIONS WS CLIENT JOINED ROOM', {
      socketId: client.id,
      room,
    });
  }

  emitNotification(userId: string, payload: NotificationJSON): void {
    this.logger.info(`EMITTING NOTIFICATION: ${SOCKET_PREFIX + userId}`);
    this.server
      .to(SOCKET_PREFIX + userId)
      .emit('notification.received', payload);
  }
}
