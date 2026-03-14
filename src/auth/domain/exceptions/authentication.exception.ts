import { DomainException } from '../../../shared/domain/exceptions';

export class MissingTokenException extends DomainException {
  constructor() {
    super('No authentication token provided', 'MISSING_TOKEN');
  }
}

export class InvalidTokenException extends DomainException {
  constructor(message: string = 'Invalid or expired token') {
    super(message, 'INVALID_TOKEN');
  }
}

export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, 'USER_NOT_FOUND', {
      userId,
    });
  }
}

export class SessionExpiredException extends DomainException {
  constructor() {
    super('Session has expired', 'SESSION_EXPIRED');
  }
}

export class InsufficientTokensException extends DomainException {
  constructor() {
    super(
      'Insufficient token balance to perform this action',
      'INSUFFICIENT_TOKENS',
    );
  }
}
