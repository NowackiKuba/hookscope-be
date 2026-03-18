import { DomainException } from '@shared/domain/exceptions';

export class CLITokenAlreadyExistsException extends DomainException {
  constructor(userId?: string) {
    const message = 'CLI token already exists for user';
    super(message, 'CLI_TOKEN_ALREADY_EXISTS', userId ? { userId } : undefined);
  }
}
