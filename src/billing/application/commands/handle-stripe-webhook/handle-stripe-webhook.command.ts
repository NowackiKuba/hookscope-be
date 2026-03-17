import type Stripe from 'stripe';

export class HandleStripeWebhookCommand {
  constructor(public readonly event: Stripe.Event) {}
}

