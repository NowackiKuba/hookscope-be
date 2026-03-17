import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeNotConfiguredException } from '@billing/domain/exceptions';
import { ConfigService } from '@nestjs/config';
import type { Config } from '@config/config.schema';
import type { StripePort } from '@billing/domain/ports/outbound/stripe/stripe.port';

export type EnsureProductAndPriceInput = {
  name: string;
  code: string;
  description?: string;
  unitAmount: number;
  currency: string;
  interval: 'month' | 'year';
};

export type CreateCheckoutSessionInput = {
  priceId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
};

@Injectable()
export class StripeService implements StripePort {
  private stripe: Stripe | null = null;

  private get client(): Stripe {
    const key = this.configService.get('STRIPE_SECRET_KEY', { infer: true });
    if (!key) throw new StripeNotConfiguredException();

    if (!this.stripe) {
      // Use the account's default Stripe API version (configured in Stripe dashboard).
      this.stripe = new Stripe(key);
    }

    return this.stripe;
  }

  constructor(private readonly configService: ConfigService<Config, true>) {}

  async createProductAndPrice(
    input: EnsureProductAndPriceInput,
  ): Promise<{ productId: string; priceId: string }> {
    const product = await this.client.products.create({
      name: input.name,
      description: input.description,
      metadata: { code: input.code },
    });

    const price = await this.client.prices.create({
      product: product.id,
      unit_amount: input.unitAmount,
      currency: input.currency,
      recurring: { interval: input.interval },
      metadata: { code: input.code },
    });

    return { productId: product.id, priceId: price.id };
  }

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<{ id: string; url: string }> {
    const session = await this.client.checkout.sessions.create({
      mode: 'subscription',
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      client_reference_id: input.userId,
      line_items: [{ price: input.priceId, quantity: 1 }],
      subscription_data: {
        metadata: {
          userId: input.userId,
        },
      },
      metadata: {
        userId: input.userId,
      },
    });

    if (!session.url) {
      throw new Error('Stripe checkout session did not return a URL');
    }

    return { id: session.id, url: session.url };
  }

  constructWebhookEvent(
    payload: Buffer,
    signature: string,
  ): Stripe.Event {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET', {
      infer: true,
    });
    if (!webhookSecret) throw new StripeNotConfiguredException();
    return this.client.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.client.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price'],
    });
  }
}
