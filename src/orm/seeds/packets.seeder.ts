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
  features: Record<string, string>;
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
      'Requests / month': '1k',
      History: '24h',
      Forwarding: 'no',
      Retry: 'no',
      'Manual retry': 'no',
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
      Endpoints: '10',
      'Requests / month': '50k',
      History: '30 days',
      Forwarding: 'yes',
      Retry: 'yes',
      'Manual retry': 'yes',
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

