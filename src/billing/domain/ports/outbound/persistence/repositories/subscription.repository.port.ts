import { Subscription } from '@billing/domain/aggregates/subscription';

export interface SubscriptionRepositoryPort {
  findByUserId(userId: string): Promise<Subscription | null>;
  findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null>;
  save(subscription: Subscription): Promise<Subscription>;
}

