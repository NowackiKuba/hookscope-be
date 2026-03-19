import type { NotificationJSON } from '@notifications/domain/aggregates/notification';

export interface NotificationSocketsServicePort {
  emitNotification(userId: string, payload: NotificationJSON): void;
}
