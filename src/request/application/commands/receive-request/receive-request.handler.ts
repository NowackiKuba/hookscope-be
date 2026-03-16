import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { Logger } from 'winston';
import { Request } from '@request/domain/aggregates/request';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { Token as RequestToken } from '@request/constants';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token as EndpointToken } from '@endpoint/constants';
import { RequestReceivedEvent } from '@request/domain/events/request-received.event';
import { RequestForwardedEvent } from '@request/domain/events/request-forwarded.event';
import { ForwardFailedEvent } from '@request/domain/events/forward-failed.event';
import { HttpService, LoggerProvider } from '@shared/constants';
import { HttpServicePort } from '@shared/domain/ports/outbound/http.service.port';
import { ReceiveRequestCommand } from './receive-request.command';

@CommandHandler(ReceiveRequestCommand)
export class ReceiveRequestHandler implements ICommandHandler<ReceiveRequestCommand> {
  constructor(
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(EndpointToken.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    @Inject(HttpService)
    private readonly httpService: HttpServicePort,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ReceiveRequestCommand): Promise<string> {
    const {
      endpointId,
      method,
      headers,
      body,
      query,
      ip,
      contentType,
      size,
      overlimit,
    } = command.payload;

    const endpoint = await this.endpointRepository.findById(endpointId);

    if (!endpoint) {
      // TODO
    }

    const request = overlimit
      ? Request.createOverlimit(endpointId)
      : Request.create({
          endpointId,
          method,
          headers,
          body,
          query,
          ip,
          contentType,
          size,
          overlimit: false,
        });

    const saved = await this.requestRepository.save(request);
    await this.endpointRepository.incrementRequestCount(endpointId, new Date());

    this.logger.info('REQUEST RECEIVED', {
      requestId: saved.id,
      endpointId: saved.endpointId,
      overlimit: saved.overlimit,
    });
    this.eventBus.publish(
      new RequestReceivedEvent(saved.id, saved.endpointId, saved.overlimit),
    );

    const targetUrl = endpoint?.targetUrl;
    if (targetUrl) {
      this.logger.info('FORWARDING REQUEST', {
        requestId: saved.id,
        targetUrl,
      });
      try {
        const response = await this.httpService.send(saved, targetUrl);
        if (response) {
          const forwardError = response.status >= 400 ? response.body : null;
          saved.onForward(response.status, forwardError ?? undefined);
          await this.requestRepository.updateForwardResult(saved.id, {
            forwardStatus: response.status,
            forwardedAt: new Date(),
            forwardError,
          });
          this.logger.info('REQUEST FORWARDED', {
            requestId: saved.id,
            endpointId: saved.endpointId,
            status: response.status,
            error: forwardError,
          });
          this.eventBus.publish(
            new RequestForwardedEvent(
              saved.id,
              saved.endpointId,
              response.status,
              targetUrl,
              forwardError,
            ),
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        saved.onForward(0, message);
        await this.requestRepository.updateForwardResult(saved.id, {
          forwardStatus: 0,
          forwardedAt: new Date(),
          forwardError: message,
        });
        this.logger.error('REQUEST FORWARD ERROR', {
          requestId: saved.id,
          endpointId: saved.endpointId,
          error: message,
        });
        this.eventBus.publish(
          new RequestForwardedEvent(
            saved.id,
            saved.endpointId,
            0,
            targetUrl,
            message,
          ),
        );
      }
    }

    return saved.id;
  }
}
