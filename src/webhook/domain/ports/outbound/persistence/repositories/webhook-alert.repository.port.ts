import { BaseFilters } from '@shared/domain/types/base-filters.type';
import { Page } from '@shared/utils/pagination';
import { WebhookAlert } from '@webhook/domain/aggreagates/webhook-alert';
import { WebhookAlertId } from '@webhook/domain/value-objects/webhook-alert-id.vo';
import { WebhookAlertStatus } from '@webhook/domain/value-objects/webhook-status.vo';
import { WebhookAlertType } from '@webhook/domain/value-objects/webhook-type.vo';

export type WebhookAlertFilters = BaseFilters & {
  type?: WebhookAlertType;
  status?: WebhookAlertStatus;
};

export interface WebhookAlertRepositoryPort {
  create(webhookAlert: WebhookAlert): Promise<WebhookAlert>;
  update(webhookAlert: WebhookAlert): Promise<void>;
  delete(id: WebhookAlertId): Promise<void>;
  getById(id: WebhookAlertId): Promise<WebhookAlert | null>;
  getByUserId(
    filters: WebhookAlertFilters,
    id: string,
  ): Promise<Page<WebhookAlert>>;
  getByEndpointId(
    filters: WebhookAlertFilters,
    id: string,
  ): Promise<Page<WebhookAlert>>;
  getLatestByEndpointAndType(
    endpointId: string,
    type: string,
  ): Promise<WebhookAlert | null>;
  getActiveByEndpointAndType(
    endpointId: string,
    type: string,
  ): Promise<WebhookAlert | null>;
}
