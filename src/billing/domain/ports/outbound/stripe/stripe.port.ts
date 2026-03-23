import type Stripe from 'stripe';

import type {
  CreateCheckoutSessionInput,
  EnsureProductAndPriceInput,
} from '@billing/infrastructure/stripe/stripe.service';

export interface StripePort {
  createProductAndPrice(
    input: EnsureProductAndPriceInput,
  ): Promise<{ productId: string; priceId: string }>;

  createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<{ id: string; url: string }>;
  createCustomerPortal(input: Stripe.BillingPortal.SessionCreateParams): Promise<{
    id: string;
    url: string;
  }>;

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event;

  getSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
}

