import { DomainException } from '../../../shared/domain/exceptions';

export class WebhookAlertNotFoundException extends DomainException {
  constructor(alertId?: string) {
    const message = alertId
      ? `Webhook alert with ID ${alertId} not found`
      : 'Webhook alert not found';
    super(message, 'WEBHOOK_ALERT_NOT_FOUND', alertId ? { alertId } : undefined);
  }
}
