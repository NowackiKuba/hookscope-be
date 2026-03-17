import { DomainException } from '@shared/domain/exceptions';

export class StripeWebhookSignatureException extends DomainException {
  constructor() {
    super('Invalid Stripe webhook signature', 'STRIPE_WEBHOOK_SIGNATURE_INVALID');
  }
}

