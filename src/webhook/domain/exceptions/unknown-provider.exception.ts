import { DomainException } from '../../../shared/domain/exceptions';

export class UnknownProviderException extends DomainException {
  constructor(providerName: string) {
    super(`Unknown webhook provider: ${providerName}`, 'UNKNOWN_WEBHOOK_PROVIDER', {
      providerName,
    });
  }
}
