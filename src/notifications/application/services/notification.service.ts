import { Inject, Injectable } from '@nestjs/common';
import { Token } from '@notifications/constants';
import { Notification } from '@notifications/domain/aggregates/notification';
import {
  NotificationFilters,
  NotificationRepositoryPort,
} from '@notifications/domain/ports/outbound/persistence/repositories/notification.repository.port';
import { NotificationId } from '@notifications/domain/value-objects/notification-id.vo';
import { Page } from '@shared/utils/pagination';
import { UserId } from '@users/domain/value-objects/user-id.vo';

export type CreateNotificationInput = {
  userId: string;
  referenceId: string;
  payload: Record<string, unknown>;
  channel?: 'inApp' | 'email' | 'slack';
  status?: 'sent' | 'read' | 'archived' | 'failed';
  failedReason?: string;
  sentAt?: Date;
};

@Injectable()
export class NotificationService {
  constructor(
    @Inject(Token.NotificationRepository)
    private readonly notificationRepository: NotificationRepositoryPort,
  ) {}

  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification = Notification.create({
      userId: input.userId,
      channel: input.channel ?? 'inApp',
      status: input.status ?? 'sent',
      referenceId: input.referenceId,
      payload: input.payload,
      failedReason: input.failedReason,
      sentAt: input.sentAt,
    });

    return this.notificationRepository.create(notification);
  }

  async getById(notificationId: string): Promise<Notification | null> {
    return this.notificationRepository.getById(NotificationId.create(notificationId));
  }

  async getByUserId(
    userId: string,
    filters: NotificationFilters,
  ): Promise<Page<Notification>> {
    return this.notificationRepository.getByUserId(
      filters,
      UserId.create(userId),
    );
  }

  async createInApp(
    userId: string,
    referenceId: string,
    payload: Record<string, unknown>,
  ): Promise<Notification> {
    return this.create({
      userId,
      referenceId,
      payload,
      channel: 'inApp',
      status: 'sent',
    });
  }
}
