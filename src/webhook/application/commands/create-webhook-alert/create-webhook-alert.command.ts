import { AlertMetadataValue } from '@webhook/domain/value-objects/alert-metadata.vo';

export class CreateWebhookAlertCommand {
  constructor(
    public readonly payload: {
      id: string;
      endpointId: string;
      userId: string;
      type: string;
      status: string;
      eventType?: string;
      metadata?: AlertMetadataValue;
    },
  ) {}
}
