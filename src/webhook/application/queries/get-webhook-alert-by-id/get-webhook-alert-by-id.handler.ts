import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Token } from '@webhook/constants';
import { WebhookAlert } from '@webhook/domain/aggreagates/webhook-alert';
import { WebhookAlertNotFoundException } from '@webhook/domain/exceptions';
import { WebhookAlertRepositoryPort } from '@webhook/domain/ports/outbound/persistence/repositories/webhook-alert.repository.port';
import { WebhookAlertId } from '@webhook/domain/value-objects/webhook-alert-id.vo';
import { GetWebhookAlertByIdQuery } from './get-webhook-alert-by-id.query';

@QueryHandler(GetWebhookAlertByIdQuery)
export class GetWebhookAlertByIdHandler implements IQueryHandler<
  GetWebhookAlertByIdQuery,
  WebhookAlert
> {
  constructor(
    @Inject(Token.WebhookAlertRepository)
    private readonly webhookAlertRepository: WebhookAlertRepositoryPort,
  ) {}

  async execute(query: GetWebhookAlertByIdQuery): Promise<WebhookAlert> {
    const { userId, alertId } = query.payload;

    const alert = await this.webhookAlertRepository.getById(
      WebhookAlertId.create(alertId),
    );

    if (!alert || alert.userId !== userId) {
      throw new WebhookAlertNotFoundException(alertId);
    }

    return alert;
  }
}
