import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type Stripe from 'stripe';
import { Token } from '@billing/constants';
import type { SubscriptionRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/subscription.repository.port';
import type { PacketRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/packet.repository.port';
import type { StripePort } from '@billing/domain/ports/outbound/stripe/stripe.port';
import { HandleStripeWebhookCommand } from './handle-stripe-webhook.command';
import { Subscription } from '@billing/domain/aggregates/subscription';
import { generateUUID } from '@shared/utils/generate-uuid';
import { addMonths } from 'date-fns';

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asUnixDate(value: unknown): Date | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return new Date(value * 1000);
  }
  return null;
}

@CommandHandler(HandleStripeWebhookCommand)
export class HandleStripeWebhookHandler implements ICommandHandler<HandleStripeWebhookCommand> {
  constructor(
    @Inject(Token.Stripe)
    private readonly stripe: StripePort,
    @Inject(Token.SubscriptionRepository)
    private readonly subscriptionRepository: SubscriptionRepositoryPort,
    @Inject(Token.PacketRepository)
    private readonly packetRepository: PacketRepositoryPort,
  ) {}

  async execute(command: HandleStripeWebhookCommand): Promise<void> {
    const event = command.event;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId =
        asString(session.subscription) ??
        asString(
          (session as unknown as Record<string, unknown>)['subscription'],
        );

      if (!subscriptionId) return;

      const subscription = await this.stripe.getSubscription(subscriptionId);
      await this.upsertFromStripeSubscription(subscription);
      return;
    }

    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const hydrated = await this.stripe.getSubscription(sub.id);
      await this.upsertFromStripeSubscription(hydrated);
      return;
    }
  }

  private async upsertFromStripeSubscription(
    sub: Stripe.Subscription,
  ): Promise<void> {
    const userId =
      asString(
        (sub.metadata as unknown as Record<string, unknown>)?.['userId'],
      ) ??
      asString(
        (sub as unknown as Record<string, unknown>)['client_reference_id'],
      );

    const stripeCustomerId =
      asString(sub.customer) ??
      asString((sub as unknown as Record<string, unknown>)['customer']);

    const stripePriceId = asString(
      sub.items?.data?.[0]?.price?.id ??
        (sub.items?.data?.[0]?.price as unknown as { id?: unknown })?.id,
    );

    if (!userId || !stripeCustomerId || !stripePriceId) return;

    const packet =
      await this.packetRepository.findByStripePriceId(stripePriceId);
    if (!packet) return;

    const existing =
      (await this.subscriptionRepository.findByStripeSubscriptionId(sub.id)) ??
      (await this.subscriptionRepository.findByUserId(userId));

    const existingId = existing?.toJSON().id;
    const packetId = packet.toJSON().id;

    const domain = Subscription.reconstitute({
      id: existingId ?? generateUUID(),
      userId,
      packetId,
      stripeCustomerId,
      stripeSubscriptionId: sub.id,
      stripePriceId,
      status: sub.status,
      currentPeriodEnd: addMonths(new Date(), 1),
      cancelAtPeriodEnd: !!sub.cancel_at_period_end,
      canceledAt: asUnixDate(sub.canceled_at),
      metadata: sub.metadata ?? undefined,
      createdAt: existing?.toJSON().createdAt,
      updatedAt: new Date(),
    });

    await this.subscriptionRepository.save(domain);
  }
}
