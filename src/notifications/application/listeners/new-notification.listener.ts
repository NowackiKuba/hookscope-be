import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NotificationService } from '@notifications/application/services/notification.service';
import { NewNotificationEvent } from '@notifications/domain/events/new-notification.event';

@EventsHandler(NewNotificationEvent)
@Injectable()
export class NewNotificationListener
  implements IEventHandler<NewNotificationEvent>
{
  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: NewNotificationEvent): Promise<void> {
    await this.notificationService.create({
      userId: event.payload.userId,
      referenceId: event.payload.referenceId,
      channel: event.payload.channel ?? 'inApp',
      status: event.payload.status ?? 'sent',
      payload: {
        message: event.payload.message,
        ...(event.payload.data ?? {}),
      },
    });
  }
}
