import { DomainException } from '@shared/domain/exceptions';

export class WaitlistValidationException extends DomainException {
  constructor(message: string = 'Invalid waitlist data') {
    super(message, 'WAITLIST_VALIDATION');
  }
}
