import { Inject, Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import type { Logger } from 'winston';

import { Token } from '@sockets/constants';
import type { SocketsServicePort } from '@sockets/domain/ports/outbound/services/sockets.service.port';
import { RequestForwardedEvent } from '@request/domain/events/request-forwarded.event';
import { LoggerProvider } from '@shared/constants';

@EventsHandler(RequestForwardedEvent)
@Injectable()
export class RequestForwardedListener implements IEventHandler<RequestForwardedEvent> {
  constructor(
    @Inject(LoggerProvider)
    private readonly logger: Logger,
    @Inject(Token.SocketsService)
    private readonly socketsService: SocketsServicePort,
  ) {}

  async handle(event: RequestForwardedEvent): Promise<void> {
    this.logger.info('REQUEST FORWARDED EVENT', {
      requestId: event.requestId,
      endpointId: event.endpointId,
      forwardStatus: event.forwardStatus,
      forwardError: event.forwardError,
    });
    this.socketsService.emitForwardUpdate(event.endpointId, {
      requestId: event.requestId,
      forwardStatus: event.forwardStatus,
      forwardError: event.forwardError,
    });
  }
}
