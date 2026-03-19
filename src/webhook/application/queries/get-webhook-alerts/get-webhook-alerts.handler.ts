import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetEndpointByIdQuery } from '@endpoint/application/queries/get-endpoint-by-id/get-endpoint-by-id.query';
import { Page } from '@shared/utils/pagination';
import { Token } from '@webhook/constants';
import { WebhookAlert } from '@webhook/domain/aggreagates/webhook-alert';
import { WebhookAlertRepositoryPort } from '@webhook/domain/ports/outbound/persistence/entities/webhook-alert.repository.port';
import { WebhookAlertStatus } from '@webhook/domain/value-objects/webhook-status.vo';
import { WebhookAlertType } from '@webhook/domain/value-objects/webhook-type.vo';
import { GetWebhookAlertsQuery } from './get-webhook-alerts.query';

@QueryHandler(GetWebhookAlertsQuery)
export class GetWebhookAlertsHandler
  implements IQueryHandler<GetWebhookAlertsQuery, Page<WebhookAlert>>
{
  constructor(
    @Inject(Token.WebhookAlertRepository)
    private readonly webhookAlertRepository: WebhookAlertRepositoryPort,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: GetWebhookAlertsQuery): Promise<Page<WebhookAlert>> {
    const p = query.payload;

    const filters = {
      limit: p.limit,
      offset: p.offset,
      orderBy: p.orderBy,
      orderByField: p.orderByField,
      type: p.type ? WebhookAlertType.create(p.type) : undefined,
      status: p.status ? WebhookAlertStatus.create(p.status) : undefined,
    };

    if (p.endpointId) {
      await this.queryBus.execute(
        new GetEndpointByIdQuery({
          userId: p.userId,
          endpointId: p.endpointId,
        }),
      );
      return this.webhookAlertRepository.getByEndpointId(filters, p.endpointId);
    }

    return this.webhookAlertRepository.getByUserId(filters, p.userId);
  }
}
