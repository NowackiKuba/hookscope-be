import { Notification } from '@notifications/domain/aggregates/notification';
import { NotificationChannelValue } from '@notifications/domain/value-objects/notification-channel.vo';
import { NotificationId } from '@notifications/domain/value-objects/notification-id.vo';
import { NotificationStatusValue } from '@notifications/domain/value-objects/notification-status.vo';
import { BaseFilters } from '@shared/domain/types/base-filters.type';
import { Page } from '@shared/utils/pagination';
import { UserId } from '@users/domain/value-objects/user-id.vo';

export type NotificationFilters = BaseFilters & {
  status?: NotificationStatusValue;
  channel?: NotificationChannelValue;
};

export interface NotificationRepositoryPort {
  create(notification: Notification): Promise<Notification>;
  update(notification: Notification): Promise<void>;
  delete(id: NotificationId): Promise<void>;
  getById(id: NotificationId): Promise<Notification | null>;
  getByUserId(
    filters: NotificationFilters,
    userId: UserId,
  ): Promise<Page<Notification>>;
}
