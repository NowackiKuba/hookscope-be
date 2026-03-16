import { Inject, Injectable } from '@nestjs/common';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import type { Logger } from 'winston';

import { Token } from '@sockets/constants';
import type { SocketsServicePort } from '@sockets/domain/ports/outbound/services/sockets.service.port';
import { RequestForwardedEvent } from '@request/domain/events/request-forwarded.event';
import { LoggerProvider } from '@shared/constants';
import { ForwardFailedEvent } from '@request/domain/events/forward-failed.event';

@EventsHandler(RequestForwardedEvent)
@Injectable()
export class RequestForwardedListener implements IEventHandler<RequestForwardedEvent> {
  constructor(
    @Inject(LoggerProvider)
    private readonly logger: Logger,
    @Inject(Token.SocketsService)
    private readonly socketsService: SocketsServicePort,
    private readonly eventBus: EventBus,
  ) {}

  async handle(event: RequestForwardedEvent): Promise<void> {
    this.socketsService.emitForwardUpdate(event.endpointId, {
      requestId: event.requestId,
      forwardStatus: event.forwardStatus,
      forwardError: event.forwardError,
    });

    if (event.forwardStatus === 0 || event.forwardStatus >= 400) {
      await this.eventBus.publish(
        new ForwardFailedEvent(
          event.requestId,
          event.endpointId,
          event.targetUrl,
          event.forwardError,
        ),
      );
    }
  }
}
