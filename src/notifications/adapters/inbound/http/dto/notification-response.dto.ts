import type { Notification } from '@notifications/domain/aggregates/notification';
import type { Page } from '@shared/utils/pagination';

export type NotificationResponseDto = {
  id: string;
  userId: string;
  channel: 'inApp' | 'email' | 'slack';
  status: 'sent' | 'read' | 'archived' | 'failed';
  referenceId: string;
  payload: Record<string, unknown>;
  failedReason: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toNotificationResponseDto(
  notification: Notification,
): NotificationResponseDto {
  const json = notification.toJSON();

  return {
    id: json.id,
    userId: json.userId,
    channel: json.channel,
    status: json.status,
    referenceId: json.referenceId,
    payload: json.payload,
    failedReason: json.failedReason ?? null,
    sentAt: json.sentAt?.toISOString() ?? null,
    createdAt: json.createdAt.toISOString(),
    updatedAt: json.updatedAt.toISOString(),
  };
}

export type PaginatedNotificationsResponseDto = {
  data: NotificationResponseDto[];
  limit?: number;
  offset?: number;
  totalCount?: number;
};

export function toPaginatedNotificationsResponseDto(
  page: Page<Notification>,
): PaginatedNotificationsResponseDto {
  return {
    data: page.data.map(toNotificationResponseDto),
    limit: page.page.limit,
    offset: page.page.offset,
    totalCount: page.page.totalCount,
  };
}
