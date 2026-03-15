import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReceiveRequestCommand } from './receive-request.command';
import { Request } from '@request/domain/aggregates/request';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { Token as RequestToken } from '@request/constants';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token as EndpointToken } from '@endpoint/constants';
import { RequestReceivedEvent } from '@request/domain/events/request-received.event';
import { HttpClientProvider } from '@shared/constants';
import { HttpClientPort } from '@shared/domain/ports/outbound/http.client.port';

@CommandHandler(ReceiveRequestCommand)
export class ReceiveRequestHandler implements ICommandHandler<ReceiveRequestCommand> {
  constructor(
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(EndpointToken.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    @Inject(HttpClientProvider)
    private readonly httpClient: HttpClientPort,
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
    this.eventBus.publish(
      new RequestReceivedEvent(saved.id, saved.endpointId, saved.overlimit),
    );

    const targetUrl = endpoint.targetUrl;
    if (targetUrl) {
      try {
        const m = method.toLowerCase();
        let response;
        if (m === 'post') {
          response = await this.httpClient.post(
            targetUrl,
            saved.body ?? undefined,
            saved.headers,
          );
        } else if (m === 'delete') {
          response = await this.httpClient.delete(targetUrl, saved.headers);
        } else if (m === 'put') {
          response = await this.httpClient.put(
            targetUrl,
            saved.body ?? undefined,
            saved.headers,
          );
        } else if (m === 'patch') {
          response = await this.httpClient.patch(
            targetUrl,
            saved.body ?? undefined,
            saved.headers,
          );
        } else {
          response = null;
        }

        if (response) {
          const errorMsg =
            response.status >= 400 ? response.body : undefined;
          saved.onForward(response.status, errorMsg);
          await this.requestRepository.updateForwardResult(saved.id, {
            forwardStatus: response.status,
            forwardedAt: new Date(),
            forwardError: errorMsg ?? null,
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : String(err);
        saved.onForward(0, message);
        await this.requestRepository.updateForwardResult(saved.id, {
          forwardStatus: 0,
          forwardedAt: new Date(),
          forwardError: message,
        });
      }
    }

    return saved.id;
  }
}
