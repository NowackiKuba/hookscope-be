import { DomainException } from '@shared/domain/exceptions';

export class RequestNotFoundException extends DomainException {
  constructor(requestId: string) {
    super(`Request with ID ${requestId} not found`, 'REQUEST_NOT_FOUND', {
      requestId,
    });
  }
}
