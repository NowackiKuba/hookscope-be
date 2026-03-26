import { Token } from '@cli-token/constants';
import { Token as AuthToken, DEFAULT_SALT } from '@auth/constants';
import { Token as RequestToken } from '@request/constants';
import { CLITokenRepositoryPort } from '@cli-token/domain/ports/outbound/persistence/repositories/cli-token.repository.port';
import { CLITokenHash } from '@cli-token/domain/value-objects/cli-token-hash.vo';
import { MikroORM } from '@mikro-orm/core';
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
import { withForkedContext } from '@shared/utils/request-context';
import { CLITokenPrefix } from '@cli-token/domain/value-objects/cli-token-prefix.vo';
import type { RequestJSON } from '@request/domain/aggregates/request';
import type { CliSocketsServicePort } from '@sockets/domain/ports/outbound/services/cli-sockets.service.port';
import { Endpoint } from '@endpoint/domain/aggregates/endpoint';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';

const ROOM_PREFIX = 'cli:endpoint:';

@WebSocketGateway({ namespace: '/cli', cors: true })
export class CliGateway implements CliSocketsServicePort {
  constructor(
    @Inject(Token.CLIToken)
    private readonly cliTokenRepository: CLITokenRepositoryPort,
    @Inject(AuthToken.HashProvider)
    private readonly hashService: HashServicePort,
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    private readonly queryBus: QueryBus,
    private readonly orm: MikroORM,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}
  @WebSocketServer() server!: Server;

  emitRequest(
    endpointId: string,
    payload: RequestJSON,
    targetUrl: string | null,
  ): void {
    this.server
      .to('cli:endpoint:' + endpointId)
      .emit('request.received', { ...payload, targetUrl });
  }

  @SubscribeMessage('auth')
  async handleAuth(client: Socket, payload: { token: string }) {
    this.logger.info('CLI AUTH START', {
      socketId: client.id,
      hasToken: typeof payload?.token === 'string' && payload.token.length > 0,
    });

    try {
      await withForkedContext(this.orm, async () => {
        const token =
          typeof payload?.token === 'string' ? payload.token.trim() : '';
        if (token.length === 0) {
          this.logger.warn('CLI AUTH MISSING TOKEN', { socketId: client.id });
          client.emit('auth.error', { message: 'invalid token' });
          client.disconnect();
          return;
        }

        if (!token.startsWith('cli_')) {
          this.logger.warn('CLI AUTH INVALID TOKEN PREFIX', {
            socketId: client.id,
            prefix: token.slice(0, 4),
          });
          client.emit('auth.error', { message: 'invalid token' });
          client.disconnect();
          return;
        }

        const raw = token.slice(4);
        if (raw.length === 0) {
          this.logger.warn('CLI AUTH EMPTY RAW TOKEN', { socketId: client.id });
          client.emit('auth.error', { message: 'invalid token' });
          client.disconnect();
          return;
        }

        const prefix = token.slice(0, 12);
        this.logger.info('CLI AUTH LOOKUP BY PREFIX', {
          socketId: client.id,
          prefix,
        });
        const cliToken = await this.cliTokenRepository.findByPrefix(
          CLITokenPrefix.create(prefix),
        );

        if (!cliToken) {
          this.logger.warn('CLI AUTH TOKEN NOT FOUND', {
            socketId: client.id,
            prefix,
          });
          client.emit('auth.error', { message: 'invalid token' });
          client.disconnect();
          return;
        }

        const isValid = await this.hashService.compare(
          raw,
          cliToken.tokenHash.value,
        );

        if (!isValid) {
          this.logger.warn('CLI AUTH HASH MISMATCH', {
            socketId: client.id,
            userId: cliToken.userId,
          });
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

        const count = Array.isArray(endpoints) ? endpoints.length : undefined;
        this.logger.info('CLI AUTH SUCCESS', {
          socketId: client.id,
          userId: cliToken.userId,
          endpointsCount: count,
        });

        client.emit('auth.success', { endpoints });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('CLI AUTH FAILED', {
        socketId: client.id,
        error: message,
      });
      client.emit('auth.error', { message: 'internal error' });
      client.disconnect();
    }
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
      await withForkedContext(this.orm, async () => {
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

  @SubscribeMessage('tunnel.response')
  async handleTunnelResponse(
    client: Socket,
    payload: { requestId: string; status: number; error?: string },
  ) {
    if (!client.data.userId) {
      client.emit('tunnel.response.error', { message: 'not authenticated' });
      return;
    }

    const { requestId, status, error } = payload ?? {};

    if (!requestId || typeof status !== 'number') {
      client.emit('tunnel.response.error', { message: 'invalid payload' });
      return;
    }

    try {
      await withForkedContext(this.orm, async () => {
        await this.requestRepository.updateForwardResult(requestId, {
          forwardStatus: status,
          forwardedAt: new Date(),
          forwardError: error ?? null,
        });

        this.logger.info('CLI TUNNEL RESPONSE RECORDED', {
          socketId: client.id,
          userId: client.data.userId,
          requestId,
          status,
          error,
        });
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error('CLI TUNNEL RESPONSE FAILED', {
        socketId: client.id,
        requestId,
        error: message,
      });
      client.emit('tunnel.response.error', { message: 'internal error' });
    }
  }
}
