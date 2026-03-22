import { DomainException } from '@shared/domain/exceptions';

export class LatestEndpointSchemaNotFoundException extends DomainException {
  constructor(endpointId: string, eventType: string) {
    super(
      `No latest schema for endpoint ${endpointId} and event type "${eventType}"`,
      'ENDPOINT_LATEST_SCHEMA_NOT_FOUND',
      { endpointId, eventType },
    );
  }
}
