import {
  EntityManager,
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import {
  NotificationFilters,
  NotificationRepositoryPort,
} from '@notifications/domain/ports/outbound/persistence/repositories/notification.repository.port';
import { NotificationMapper } from '../mappers/notification.mapper';
import { NotificationEntity } from '../entities/notification.entity';
import { Notification } from '@notifications/domain/aggregates/notification';
import { NotificationId } from '@notifications/domain/value-objects/notification-id.vo';
import { Page, paginate } from '@shared/utils/pagination';
import { UserId } from '@users/domain/value-objects/user-id.vo';

@Injectable()
export class NotificationRepository implements NotificationRepositoryPort {
  private readonly dbSource: EntityRepository<NotificationEntity>;
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: NotificationMapper,
  ) {
    this.dbSource = this.em.getRepository(NotificationEntity);
  }

  async create(notification: Notification): Promise<Notification> {
    const res = this.dbSource.create(this.mapper.toEntity(notification));

    this.em.persist(res);

    await this.em.flush();

    return this.mapper.toDomain(res);
  }

  async delete(id: NotificationId): Promise<void> {
    await this.dbSource.nativeDelete({ id: id.value });
  }

  async getById(id: NotificationId): Promise<Notification> {
    const notification = await this.dbSource.findOne({ id: id.value });

    return notification ? this.mapper.toDomain(notification) : null;
  }

  async getByUserId(
    filters: NotificationFilters,
    userId: UserId,
  ): Promise<Page<Notification>> {
    const where: FilterQuery<NotificationEntity> = {
      user: {
        id: userId.value,
      },
    };

    const { channel, limit, offset, orderBy, orderByField, status } = filters;

    if (channel) {
      where.channel = channel;
    }

    if (status) {
      where.status = status;
    }

    const [notifications, totalCount] = await this.dbSource.findAndCount(
      where,
      {
        limit,
        offset,
        orderBy: {
          [orderByField]: orderBy,
        },
      },
    );

    return paginate(
      notifications.map((notification) => this.mapper.toDomain(notification)),
      { limit, offset, totalCount },
    );
  }

  async update(notification: Notification): Promise<void> {
    await this.dbSource.nativeUpdate(
      { id: notification.id.value },
      this.mapper.toEntity(notification),
    );
  }
}
