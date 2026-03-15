import { Inject, Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerProvider } from '@shared/constants';
import type { Logger } from 'winston';

import { Token } from '@sockets/constants';
import { Token as RequestToken } from '@request/constants';
import type { SocketsServicePort } from '@sockets/domain/ports/outbound/services/sockets.service.port';
import { RequestReceivedEvent } from '@request/domain/events/request-received.event';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';

@EventsHandler(RequestReceivedEvent)
@Injectable()
export class RequestReceivedListener implements IEventHandler<RequestReceivedEvent> {
  constructor(
    @Inject(LoggerProvider)
    private readonly logger: Logger,
    @Inject(Token.SocketsService)
    private readonly socketsService: SocketsServicePort,
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
  ) {}

  async handle(event: RequestReceivedEvent): Promise<void> {
    const request = await this.requestRepository.findById(event.requestId);
    if (!request) {
      this.logger.warn('RequestReceivedListener: request not found', {
        requestId: event.requestId,
        endpointId: event.endpointId,
      });
      return;
    }

    const payload = request.toJSON();
    this.socketsService.emitRequest(event.endpointId, payload);
  }
}
