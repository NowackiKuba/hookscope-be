import type { Subscription } from '@billing/domain/aggregates/subscription';

export type SubscriptionResponseDto = {
  id: string;
  userId: string;
  packetId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

export function toSubscriptionResponseDto(
  subscription: Subscription,
): SubscriptionResponseDto {
  const json = subscription.toJSON();
  return {
    id: json.id,
    userId: json.userId,
    packetId: json.packetId,
    stripeCustomerId: json.stripeCustomerId,
    stripeSubscriptionId: json.stripeSubscriptionId,
    stripePriceId: json.stripePriceId,
    status: json.status,
    currentPeriodEnd: json.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: json.cancelAtPeriodEnd,
    canceledAt: json.canceledAt?.toISOString() ?? null,
    metadata: json.metadata,
    createdAt: json.createdAt.toISOString(),
    updatedAt: json.updatedAt.toISOString(),
  };
}

