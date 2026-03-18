import { DomainException } from '@shared/domain/exceptions';

export class UsernameAlreadyExistsException extends DomainException {
  constructor(username: string) {
    super(
      `Username ${username} is already taken`,
      'USERNAME_ALREADY_EXISTS',
      { username },
    );
  }
}

