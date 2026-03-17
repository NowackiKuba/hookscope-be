import { DomainException } from '@shared/domain/exceptions';

export class RetryNotFoundException extends DomainException {
  constructor(retryId: string) {
    super(`Retry with ID ${retryId} not found`, 'RETRY_NOT_FOUND', {
      retryId,
    });
  }
}
