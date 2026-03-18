import { Token } from '@cli-token/constants';
import { Token as AuthToken } from '@auth/constants';
import { CLITokenRepositoryPort } from '@cli-token/domain/ports/outbound/persistence/repositories/cli-token.repository.port';
import { CLITokenHash } from '@cli-token/domain/value-objects/cli-token-hash.vo';
import { Inject } from '@nestjs/common';
import { LoggerProvider } from '@shared/constants';
import type { Logger } from 'winston';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HashServicePort } from '@auth/domain/ports/services/hash.service.port';
import { QueryBus } from '@nestjs/cqrs';
import { GetEndpointsQuery } from '@endpoint/application/queries/get-endpoints/get-endpoints.query';
import { GetEndpointByIdQuery } from '@endpoint/application/queries/get-endpoint-by-id/get-endpoint-by-id.query';
import { Endpoint } from '@endpoint/domain/endpoint.entity';

const ROOM_PREFIX = 'cli:endpoint:';

@WebSocketGateway({ namespace: '/cli', cors: true })
export class CliGateway {
  constructor(
    @Inject(Token.CLIToken)
    private readonly cliTokenRepository: CLITokenRepositoryPort,
    @Inject(AuthToken.HashProvider)
    private readonly hashService: HashServicePort,
    private readonly queryBus: QueryBus,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}
  @WebSocketServer() server!: Server;

  @SubscribeMessage('auth')
  async handleAuth(client: Socket, payload: { token: string }) {
    const raw = payload.token.replace('cli_', '');

    const cliToken = await this.cliTokenRepository.findByTokenHash(
      CLITokenHash.create(raw),
    );

    if (!cliToken) {
      client.emit('auth.error', { message: 'invalid token' });
      client.disconnect();
      return;
    }

    const isValid = await this.hashService.compare(
      raw,
      cliToken.tokenHash.value,
    );

    if (!isValid) {
      client.emit('auth.error', { message: 'invalid token' });
      client.disconnect();
      return;
    }

    client.data.userId = cliToken.userId;

    cliToken.markUsed();

    await this.cliTokenRepository.save(cliToken);

    const endpoints = await this.queryBus.execute(
      new GetEndpointsQuery({ userId: cliToken.userId }),
    );

    client.emit('auth.success', { endpoints });
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(client: Socket, payload: { endpointId: string }) {
    const endpointId = payload?.endpointId;
    this.logger.info('CLI SUBSCRIBE START', {
      socketId: client.id,
      userId: client.data.userId,
      endpointId,
    });

    if (!client.data.userId) {
      this.logger.warn('CLI SUBSCRIBE NOT AUTHENTICATED', {
        socketId: client.id,
        endpointId,
      });
      client.emit('subscribe.error', { message: 'not authenticated' });
      return;
    }

    try {
      const endpoint = (await this.queryBus.execute(
        new GetEndpointByIdQuery({
          userId: client.data.userId,
          endpointId,
        }),
      )) as Endpoint | null;

      if (!endpoint) {
        this.logger.warn('CLI SUBSCRIBE ENDPOINT NOT FOUND', {
          socketId: client.id,
          userId: client.data.userId,
          endpointId,
        });
        client.emit('subscribe.error', { message: 'endpoint not found' });
        return;
      }

      if (endpoint.userId !== client.data.userId) {
        this.logger.warn('CLI SUBSCRIBE FORBIDDEN', {
          socketId: client.id,
          userId: client.data.userId,
          endpointId,
          endpointUserId: endpoint.userId,
        });
        client.emit('subscribe.error', { message: 'forbidden' });
        return;
      }

      const room = ROOM_PREFIX + endpoint.id;
      client.join(room);
      this.logger.info('CLI SUBSCRIBE SUCCESS', {
        socketId: client.id,
        userId: client.data.userId,
        endpointId,
        room,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('CLI SUBSCRIBE FAILED', {
        socketId: client.id,
        userId: client.data.userId,
        endpointId,
        error: message,
      });
      client.emit('subscribe.error', { message: 'internal error' });
    }
  }
}
