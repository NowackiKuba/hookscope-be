import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { Logger } from 'winston';
import { Request } from '@request/domain/aggregates/request';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { Token as RequestToken } from '@request/constants';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token as EndpointToken } from '@endpoint/constants';
import { RequestReceivedEvent } from '@request/domain/events/request-received.event';
import { HttpClientProvider, LoggerProvider } from '@shared/constants';
import { HttpClientPort } from '@shared/domain/ports/outbound/http.client.port';
import { RequestForwardedEvent } from '@request/domain/events/request-forwarded.event';
import { ReceiveRequestCommand } from './receive-request.command';

@CommandHandler(ReceiveRequestCommand)
export class ReceiveRequestHandler implements ICommandHandler<ReceiveRequestCommand> {
  constructor(
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(EndpointToken.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    @Inject(HttpClientProvider)
    private readonly httpClient: HttpClientPort,
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
    this.logger.info('REQUEST RECEIVED EVENT', {
      requestId: saved.id,
      endpointId: saved.endpointId,
      overlimit: saved.overlimit,
    });
    this.eventBus.publish(
      new RequestReceivedEvent(saved.id, saved.endpointId, saved.overlimit),
    );

    const targetUrl = endpoint.targetUrl;
    this.logger.info('FORWARD TARGET URL', { targetUrl, requestId: saved.id });
    if (targetUrl) {
      const headersToForward = { ...saved.headers };

      // usuń nagłówki które nie powinny być forwardowane
      delete headersToForward['host'];
      delete headersToForward['content-length'];
      delete headersToForward['transfer-encoding'];
      delete headersToForward['connection'];
      try {
        const m = method.toLowerCase();
        let response;
        if (m === 'post') {
          response = await this.httpClient.post(
            targetUrl,
            saved.body ?? undefined,
            headersToForward,
          );
        } else if (m === 'delete') {
          response = await this.httpClient.delete(targetUrl, headersToForward);
        } else if (m === 'put') {
          response = await this.httpClient.put(
            targetUrl,
            saved.body ?? undefined,
            headersToForward,
          );
        } else if (m === 'patch') {
          response = await this.httpClient.patch(
            targetUrl,
            saved.body ?? undefined,
            headersToForward,
          );
        } else {
          response = null;
        }

        if (response) {
          const errorMsg = response.status >= 400 ? response.body : undefined;
          saved.onForward(response.status, errorMsg);
          await this.requestRepository.updateForwardResult(saved.id, {
            forwardStatus: response.status,
            forwardedAt: new Date(),
            forwardError: errorMsg ?? null,
          });
          this.logger.info('REQUEST FORWARDED SUCCESS', {
            requestId: saved.id,
            endpointId: saved.endpointId,
            status: response.status,
            error: errorMsg ?? null,
          });
          this.eventBus.publish(
            new RequestForwardedEvent(
              saved.id,
              saved.endpointId,
              response.status,
              errorMsg ?? null,
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
        this.logger.error('REQUEST FORWARDED ERROR', {
          requestId: saved.id,
          endpointId: saved.endpointId,
          error: message,
        });
        this.eventBus.publish(
          new RequestForwardedEvent(saved.id, saved.endpointId, 0, message),
        );
      }
    }

    return saved.id;
  }
}
