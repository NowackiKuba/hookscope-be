import { AlertMetadataValue } from '../value-objects/alert-metadata.vo';

export class AlertDetectedEvent {
  constructor(
    public readonly payload: {
      type: string;
      endpointId: string;
      userId: string;
      metadata: AlertMetadataValue;
      eventType?: string;
    },
  ) {}
}
