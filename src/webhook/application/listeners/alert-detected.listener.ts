import { Inject } from '@nestjs/common';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NewNotificationEvent } from '@notifications/domain/events/new-notification.event';
import { generateUUID } from '@shared/utils/generate-uuid';
import { Token } from '@webhook/constants';
import { WebhookAlert } from '@webhook/domain/aggreagates/webhook-alert';
import { AlertDetectedEvent } from '@webhook/domain/events/alert-detected.event';
import { WebhookAlertRepositoryPort } from '@webhook/domain/ports/outbound/persistence/repositories/webhook-alert.repository.port';

@EventsHandler(AlertDetectedEvent)
export class AlertDetectedListener implements IEventHandler<AlertDetectedEvent> {
  constructor(
    @Inject(Token.WebhookAlertRepository)
    private readonly webhookAlertRepository: WebhookAlertRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async handle(event: AlertDetectedEvent): Promise<string> {
    const alert = WebhookAlert.create({
      endpointId: event.payload.endpointId,
      status: 'unread',
      type: event.payload.type,
      userId: event.payload.userId,
      eventType: event.payload.eventType,
      metadata: event.payload.metadata,
      id: generateUUID(),
    });

    await this.webhookAlertRepository.create(alert);
    await this.eventBus.publish(
      new NewNotificationEvent({
        userId: event.payload.userId,
        referenceId: alert.id.value,
        channel: 'inApp',
        status: 'sent',
        message: `Webhook alert detected: ${event.payload.type}`,
        data: {
          alertType: event.payload.type,
          endpointId: event.payload.endpointId,
          eventType: event.payload.eventType,
          metadata: event.payload.metadata,
        },
      }),
    );

    return alert.id.value;
  }
}
