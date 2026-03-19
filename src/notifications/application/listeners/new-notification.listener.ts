import { Inject, Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NotificationService } from '@notifications/application/services/notification.service';
import { Token } from '@notifications/constants';
import { NewNotificationEvent } from '@notifications/domain/events/new-notification.event';
import { NotificationSocketsServicePort } from '@notifications/domain/ports/outbound/services/notification-sockets.service.port';

@EventsHandler(NewNotificationEvent)
@Injectable()
export class NewNotificationListener
  implements IEventHandler<NewNotificationEvent>
{
  constructor(
    private readonly notificationService: NotificationService,
    @Inject(Token.NotificationSocketsService)
    private readonly notificationSocketsService: NotificationSocketsServicePort,
  ) {}

  async handle(event: NewNotificationEvent): Promise<void> {
    const notification = await this.notificationService.create({
      userId: event.payload.userId,
      referenceId: event.payload.referenceId,
      channel: event.payload.channel ?? 'inApp',
      status: event.payload.status ?? 'sent',
      payload: {
        message: event.payload.message,
        ...(event.payload.data ?? {}),
      },
    });

    this.notificationSocketsService.emitNotification(
      event.payload.userId,
      notification.toJSON(),
    );
  }
}
