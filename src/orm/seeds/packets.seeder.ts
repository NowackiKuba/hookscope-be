import { Seeder } from '@mikro-orm/seeder';
import type { EntityManager } from '@mikro-orm/postgresql';
import { PacketEntity } from '@billing/adapters/outbound/persistence/entities/packet.entity';
import Stripe from 'stripe';

const DEFAULT_PACKETS: Array<{
  code: string;
  name: string;
  description: string;
  unitAmount: number;
  currency: string;
  interval: 'month' | 'year';
  features: Record<string, string | boolean>;
}> = [
  {
    code: 'free',
    name: 'Free',
    description: 'For testing and small integrations.',
    unitAmount: 0,
    currency: 'usd',
    interval: 'month',
    features: {
      Endpoints: '3',
      'Requests / month': '1,000',
      'Request history': '7 days',
      'CLI tunnel': true,
      Forwarding: true,
      Retry: true,
      'Manual retry': true,
      'Signature verification': true,
      'Schema drift alerts': true,
      'Duplicate detection': true,
      'Silence detection': true,
      'In-app notifications': true,
      'Email notifications': false,
      'Slack / Discord notifications': false,
      'DTO generation': false,
      'Volume spike detection': false,
    },
  },
  {
    code: 'pro',
    name: 'Pro',
    description: 'For production and growing teams.',
    unitAmount: 1200,
    currency: 'usd',
    interval: 'month',
    features: {
      Endpoints: 'Unlimited',
      'Requests / month': '50,000',
      'Request history': '90 days',
      'CLI tunnel': true,
      Forwarding: true,
      Retry: true,
      'Manual retry': true,
      'Signature verification': true,
      'Schema drift alerts': true,
      'Duplicate detection': true,
      'Silence detection': true,
      'In-app notifications': true,
      'Email notifications': true,
      'Slack / Discord notifications': true,
      'DTO generation': true,
      'Volume spike detection': true,
    },
  },
];

export class PacketsSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const stripe = stripeKey ? new Stripe(stripeKey) : null;

    for (const p of DEFAULT_PACKETS) {
      const existing = await em.findOne(PacketEntity, { code: p.code });
      const entity =
        existing ??
        new PacketEntity({
          code: p.code,
          name: p.name,
          description: p.description,
          unitAmount: p.unitAmount,
          currency: p.currency,
          interval: p.interval,
          features: p.features,
          isActive: true,
        });

      entity.name = p.name;
      entity.description = p.description;
      entity.unitAmount = p.unitAmount;
      entity.currency = p.currency;
      entity.interval = p.interval;
      entity.features = p.features;
      entity.isActive = true;

      if (stripe && (!entity.stripeProductId || !entity.stripePriceId)) {
        const product = await stripe.products.create({
          name: entity.name,
          description: entity.description,
          metadata: { code: entity.code },
        });
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: entity.unitAmount,
          currency: entity.currency,
          recurring: { interval: entity.interval },
          metadata: { code: entity.code },
        });
        entity.stripeProductId = product.id;
        entity.stripePriceId = price.id;
      }

      await em.persistAndFlush(entity);
    }
  }
}
