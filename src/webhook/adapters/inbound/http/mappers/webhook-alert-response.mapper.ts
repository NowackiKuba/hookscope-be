import type { WebhookAlert } from '@webhook/domain/aggreagates/webhook-alert';
import type { AlertMetadataValue } from '@webhook/domain/value-objects/alert-metadata.vo';
import type { Page } from '@shared/utils/pagination';
import type {
  PaginatedWebhookAlertsResponseDto,
  WebhookAlertMetadataJson,
  WebhookAlertResponseDto,
} from '../dto/webhook-alert-response.dto';

function serializeMetadata(
  metadata: AlertMetadataValue | undefined,
): WebhookAlertMetadataJson | undefined {
  if (metadata == null) {
    return undefined;
  }

  if (
    typeof metadata === 'object' &&
    metadata !== null &&
    'lastSeenAt' in metadata &&
    metadata.lastSeenAt instanceof Date
  ) {
    return {
      ...metadata,
      lastSeenAt: metadata.lastSeenAt.toISOString(),
    };
  }

  return metadata;
}

export function toWebhookAlertResponseDto(
  alert: WebhookAlert,
): WebhookAlertResponseDto {
  const json = alert.toJSON();
  return {
    id: json.id,
    endpointId: json.endpointId,
    userId: json.userId,
    type: json.type,
    status: json.status,
    eventType: json.eventType,
    metadata: serializeMetadata(json.metadata),
    createdAt: json.createdAt.toISOString(),
    updatedAt: json.updatedAt.toISOString(),
  };
}

export function toPaginatedWebhookAlertsResponseDto(
  page: Page<WebhookAlert>,
): PaginatedWebhookAlertsResponseDto {
  return {
    data: page.data.map(toWebhookAlertResponseDto),
    page: page.page,
  };
}
