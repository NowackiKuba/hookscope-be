import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Token } from '@notifications/constants';
import { NotificationMapper } from '@notifications/adapters/outbound/persistence/mappers/notification.mapper';
import { NotificationRepository } from '@notifications/adapters/outbound/persistence/repositories/notification.repository';
import { NotificationService } from '@notifications/application/services/notification.service';
import { NotificationsController } from '@notifications/adapters/inbound/http/controllers/notifications.controller';
import { NewNotificationListener } from '@notifications/application/listeners/new-notification.listener';
import { AuthModule } from '@auth/auth.module';

@Global()
@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationMapper,
    NotificationRepository,
    NotificationService,
    NewNotificationListener,
    {
      provide: Token.NotificationRepository,
      useExisting: NotificationRepository,
    },
  ],
  exports: [CqrsModule, NotificationService, Token.NotificationRepository],
})
export class NotificationsModule {}
