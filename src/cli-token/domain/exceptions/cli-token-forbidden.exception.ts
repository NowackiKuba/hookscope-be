import { DomainException } from '@shared/domain/exceptions';

export class CLITokenForbiddenException extends DomainException {
  constructor() {
    super('CLI token does not belong to user', 'CLI_TOKEN_FORBIDDEN');
  }
}
