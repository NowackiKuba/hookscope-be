import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { NotificationEntity } from '../entities/notification.entity';
import { Notification } from '@notifications/domain/aggregates/notification';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';

@Injectable()
export class NotificationMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: NotificationEntity): Notification {
    return Notification.create({
      ...entity,
      userId: entity.user.id,
    });
  }

  toEntity(domain: Notification): NotificationEntity {
    const domainJSON = domain.toJSON();

    return new NotificationEntity({
      ...domainJSON,
      user: this.em.getReference(UserEntity, domainJSON.userId),
    });
  }
}
