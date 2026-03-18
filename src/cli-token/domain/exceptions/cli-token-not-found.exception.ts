import { DomainException } from '@shared/domain/exceptions';

export class CLITokenNotFoundException extends DomainException {
  constructor(id?: string) {
    const message = id
      ? `CLI token with ID ${id} not found`
      : 'CLI token not found';
    super(message, 'CLI_TOKEN_NOT_FOUND', id ? { id } : undefined);
  }
}
