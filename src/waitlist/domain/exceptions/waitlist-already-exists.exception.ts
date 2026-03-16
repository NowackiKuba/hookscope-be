import { DomainException } from '@shared/domain/exceptions';

export class WaitlistAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`Email ${email} is already on the waitlist`, 'WAITLIST_ALREADY_EXISTS', {
      email,
    });
  }
}
