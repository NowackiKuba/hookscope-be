import { DomainException } from '@shared/domain/exceptions';

export class EndpointNotFoundException extends DomainException {
  constructor(endpointId?: string) {
    const message = endpointId
      ? `Endpoint with ID ${endpointId} not found`
      : 'Endpoint not found';
    super(message, 'ENDPOINT_NOT_FOUND', endpointId ? { endpointId } : undefined);
  }
}
