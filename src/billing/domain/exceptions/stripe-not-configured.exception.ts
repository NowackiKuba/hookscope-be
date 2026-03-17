import { DomainException } from '@shared/domain/exceptions';

export class StripeNotConfiguredException extends DomainException {
  constructor() {
    super('Stripe is not configured', 'STRIPE_NOT_CONFIGURED');
  }
}

