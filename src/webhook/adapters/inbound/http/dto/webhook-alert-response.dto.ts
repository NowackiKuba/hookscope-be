import type { AlertMetadataValue } from '@webhook/domain/value-objects/alert-metadata.vo';
import type { PageParams } from '@shared/utils/pagination';

/** JSON-serialized alert metadata (e.g. dates as ISO strings). */
export type WebhookAlertMetadataJson =
  | AlertMetadataValue
  | Record<string, unknown>;

export type WebhookAlertResponseDto = {
  id: string;
  endpointId: string;
  userId: string;
  type: string;
  status: string;
  eventType?: string;
  scannerStatus: string;
  metadata?: WebhookAlertMetadataJson;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedWebhookAlertsResponseDto = {
  data: WebhookAlertResponseDto[];
  page: PageParams;
};
