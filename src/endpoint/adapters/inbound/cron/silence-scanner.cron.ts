import { Token } from '@endpoint/constants';
import { Token as RequestToken } from '@request/constants';
import { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { AlertDetectedEvent } from '@webhook/domain/events/alert-detected.event';
import { AlertMetadata } from '@webhook/domain/value-objects/alert-metadata.vo';
import { withForkedContext } from '@shared/utils/request-context';
import { MikroORM } from '@mikro-orm/postgresql';
import { Token as WebhookToken } from '@webhook/constants';
import { WebhookAlertRepositoryPort } from '@webhook/domain/ports/outbound/persistence/repositories/webhook-alert.repository.port';

@Injectable()
export class SilenceScannerCron {
  constructor(
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(WebhookToken.WebhookAlertRepository)
    private readonly webhookAlertRepository: WebhookAlertRepositoryPort,
    private readonly eventBus: EventBus,
    private readonly orm: MikroORM,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async process() {
    await withForkedContext(this.orm, async () => {
      let page = 0;
      const limit = 100;

      while (true) {
        const endpoints = await this.endpointRepository.getAll({
          limit,
          offset: page * limit,
          orderBy: 'desc',
          orderByField: 'createdAt',
          isActive: true,
        });

        if (!endpoints.data.length) break;

        const lastRequests =
          await this.requestRepository.findLastRequestPerEndpoint(
            endpoints.data.map((e) => e.id),
          );

        await Promise.all(
          endpoints.data.map(async (endpoint) => {
            const lastRequest = lastRequests.get(endpoint.id);
            if (!lastRequest) {
              return;
            }

            const silenceDurationMs =
              Date.now() - lastRequest.receivedAt.getTime();
            const silenceDurationMinutes = Math.floor(
              silenceDurationMs / 60000,
            );

            if (silenceDurationMinutes < endpoint.silenceTreshold.value) {
              const activeAlert =
                await this.webhookAlertRepository.getActiveByEndpointAndType(
                  endpoint.id,
                  'silence_detected',
                );
              if (activeAlert) {
                activeAlert.resolve();
                await this.webhookAlertRepository.update(activeAlert);
              }
              return;
            }

            await this.eventBus.publish(
              new AlertDetectedEvent({
                type: 'silence_detected',
                endpointId: endpoint.id,
                userId: endpoint.userId,
                metadata: AlertMetadata.silenceDetected({
                  lastSeenAt: lastRequest.receivedAt,
                  silenceDurationMinutes,
                }).value,
              }),
            );
          }),
        );

        if (endpoints.data.length < limit) break;

        page++;
      }
    });
  }
}
