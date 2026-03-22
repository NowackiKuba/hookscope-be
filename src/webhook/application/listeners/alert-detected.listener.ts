import { Inject, Logger } from '@nestjs/common';
import { EventBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NewNotificationEvent } from '@notifications/domain/events/new-notification.event';
import { Token as NotificationsToken } from '@notifications/constants';
import type { NotificationProviderPort } from '@notifications/domain/ports/outbound/external/notification-provider.port';
import { generateUUID } from '@shared/utils/generate-uuid';
import { Token } from '@webhook/constants';
import { WebhookAlert } from '@webhook/domain/aggreagates/webhook-alert';
import { AlertDetectedEvent } from '@webhook/domain/events/alert-detected.event';
import { WebhookAlertRepositoryPort } from '@webhook/domain/ports/outbound/persistence/repositories/webhook-alert.repository.port';
import { Token as UserSettingsToken } from '@user-settings/constants';
import type { UserSettingsRepositoryPort } from '@user-settings/domain/ports/outbound/persistence/repositories/user-settings.repository.port';
import {
  DuplicateDetectedMetadata,
  EndpointErrorMetadata,
  SchemaDriftMetadata,
  SecurityThreatMetadata,
  SignatureFailedMetadata,
  SilenceDetectedMetadata,
  VolumeSpikeMetadata,
} from '@webhook/domain/value-objects/alert-metadata.vo';

const ALERT_COOLDOWN_MS = 30 * 60 * 1000;

@EventsHandler(AlertDetectedEvent)
export class AlertDetectedListener implements IEventHandler<AlertDetectedEvent> {
  private readonly logger = new Logger(AlertDetectedListener.name);

  constructor(
    @Inject(Token.WebhookAlertRepository)
    private readonly webhookAlertRepository: WebhookAlertRepositoryPort,
    private readonly eventBus: EventBus,
    @Inject(NotificationsToken.NotificationProvider)
    private readonly notificationProvider: NotificationProviderPort,
    @Inject(UserSettingsToken.UserSettingsRepository)
    private readonly userSettingsRepository: UserSettingsRepositoryPort,
  ) {}

  async handle(event: AlertDetectedEvent): Promise<string> {
    const activeAlert =
      await this.webhookAlertRepository.getActiveByEndpointAndType(
        event.payload.endpointId,
        event.payload.type,
      );
    if (activeAlert) {
      return activeAlert.id.value;
    }

    const latestAlert =
      await this.webhookAlertRepository.getLatestByEndpointAndType(
        event.payload.endpointId,
        event.payload.type,
      );
    if (
      latestAlert &&
      latestAlert.scannerStatus.value === 'resolved' &&
      Date.now() - latestAlert.updatedAt.getTime() < ALERT_COOLDOWN_MS
    ) {
      return latestAlert.id.value;
    }

    const alert = WebhookAlert.create({
      endpointId: event.payload.endpointId,
      status: 'unread',
      scannerStatus: 'active',
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

    await this.sendExternalWebhookNotifications(event);

    return alert.id.value;
  }

  private buildExternalAlertText(event: AlertDetectedEvent): string {
    const { type, endpointId, eventType, metadata } = event.payload;
    const endpoint = `Endpoint: ${endpointId}`;
    const eventLine = eventType ? `Event: ${eventType}` : null;
    const base = ['🚨 HookScope Alert', endpoint, eventLine]
      .filter(Boolean)
      .join('\n');

    switch (type) {
      case 'schema_drift': {
        const m = metadata as SchemaDriftMetadata;
        const lines = [`${base}\nType: Schema Drift`];
        if (m.added.length > 0)
          lines.push(`Added fields: ${m.added.join(', ')}`);
        if (m.removed.length > 0)
          lines.push(`Removed fields: ${m.removed.join(', ')}`);
        if (m.typeChanged.length > 0) {
          const changes = m.typeChanged
            .map((c) => `${c.field}: ${c.from} → ${c.to}`)
            .join(', ');
          lines.push(`Type changes: ${changes}`);
        }
        return lines.join('\n');
      }

      case 'endpoint_error': {
        const m = metadata as EndpointErrorMetadata;
        return [
          `${base}\nType: Endpoint Error`,
          `Status: ${m.statusCode}`,
          `Request ID: ${m.requestId}`,
          m.responseBody ? `Response: ${m.responseBody.slice(0, 200)}` : null,
        ]
          .filter(Boolean)
          .join('\n');
      }

      case 'signature_failed': {
        const m = metadata as SignatureFailedMetadata;
        return [
          `${base}\nType: Signature Failed`,
          `Provider: ${m.provider}`,
          `IP: ${m.ip}`,
          `Request ID: ${m.requestId}`,
        ].join('\n');
      }

      case 'duplicate_detected': {
        const m = metadata as DuplicateDetectedMetadata;
        return [
          `${base}\nType: Duplicate Webhook Detected`,
          `Original Request: ${m.originalRequestId}`,
          `Duplicate Request: ${m.duplicateRequestId}`,
        ].join('\n');
      }

      case 'volume_spike': {
        const m = metadata as VolumeSpikeMetadata;
        return [
          `${base}\nType: Volume Spike`,
          `Normal rate: ${m.normalRate} req/h`,
          `Current rate: ${m.currentRate} req/h`,
          `Multiplier: ${m.multiplier.toFixed(1)}x above normal`,
        ].join('\n');
      }

      case 'silence_detected': {
        const m = metadata as SilenceDetectedMetadata;
        const hours = Math.floor(m.silenceDurationMinutes / 60);
        const minutes = m.silenceDurationMinutes % 60;
        const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        return [
          `${base}\nType: Silence Detected`,
          `Silent for: ${duration}`,
          `Last seen: ${new Date(m.lastSeenAt).toUTCString()}`,
        ].join('\n');
      }

      case 'security_threat': {
        const m = metadata as SecurityThreatMetadata;
        return [
          `${base}\nType: Security Threat`,
          `IP: ${m.ip}`,
          `Failed attempts: ${m.failedAttempts} in ${m.windowMinutes} minutes`,
        ].join('\n');
      }

      default:
        return base;
    }
  }

  private async sendExternalWebhookNotifications(
    event: AlertDetectedEvent,
  ): Promise<void> {
    const settings = await this.userSettingsRepository.findByUserId(
      event.payload.userId,
    );
    if (!settings) {
      return;
    }

    const channels = settings.notificationChannels;
    const text = this.buildExternalAlertText(event);
    const deliveries: Promise<void>[] = [];

    if (channels.slack && settings.slackWebhookUrl) {
      deliveries.push(
        this.notificationProvider.notify({
          url: settings.slackWebhookUrl,
          body: { text },
        }),
      );
    }

    if (channels.discord && settings.discordWebhookUrl) {
      deliveries.push(
        this.notificationProvider.notify({
          url: settings.discordWebhookUrl,
          body: { content: text },
        }),
      );
    }

    if (deliveries.length === 0) {
      return;
    }

    const results = await Promise.allSettled(deliveries);
    for (const result of results) {
      if (result.status === 'rejected') {
        this.logger.warn(
          `External alert webhook failed: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
        );
      }
    }
  }
}
