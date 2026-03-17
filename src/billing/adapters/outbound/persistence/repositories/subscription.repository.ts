import { EntityManager } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { SubscriptionEntity } from '../entities/subscription.entity';
import type { SubscriptionRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/subscription.repository.port';
import { SubscriptionMapper } from '../mappers/subscription.mapper';
import { Subscription } from '@billing/domain/aggregates/subscription';

function getEm(fallback: EntityManager): EntityManager {
  const ctx = RequestContext.getEntityManager();
  return (ctx ?? fallback) as EntityManager;
}

@Injectable()
export class SubscriptionRepository implements SubscriptionRepositoryPort {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: SubscriptionMapper,
  ) {}

  private getEm(): EntityManager {
    return getEm(this.em);
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const em = this.getEm();
    const entity = await em.findOne(
      SubscriptionEntity,
      { user: { id: userId } },
      { populate: ['packet'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<Subscription | null> {
    const em = this.getEm();
    const entity = await em.findOne(
      SubscriptionEntity,
      { stripeSubscriptionId },
      { populate: ['packet'] },
    );
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async save(subscription: Subscription): Promise<Subscription> {
    const em = this.getEm();
    const json = subscription.toJSON();

    const existing =
      (await em.findOne(
        SubscriptionEntity,
        { stripeSubscriptionId: json.stripeSubscriptionId },
        { populate: ['packet'] },
      )) ??
      (await em.findOne(
        SubscriptionEntity,
        { user: { id: json.userId } },
        { populate: ['packet'] },
      ));

    if (!existing) {
      const created = this.mapper.toPersistence(subscription);
      em.persist(created);
      await em.flush();
      return this.mapper.toDomain(created);
    }

    this.mapper.applyDomainToEntity(subscription, existing);
    await em.flush();
    return this.mapper.toDomain(existing);
  }
}

