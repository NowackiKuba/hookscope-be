import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { Subscription } from '@billing/domain/aggregates/subscription';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';
import { PacketEntity } from '../entities/packet.entity';

@Injectable()
export class SubscriptionMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: SubscriptionEntity): Subscription {
    const userId =
      entity.user?.id ??
      (entity as unknown as { user_id?: string }).user_id ??
      '';
    const packetId =
      entity.packet?.id ??
      (entity as unknown as { packet_id?: string }).packet_id ??
      '';
    return Subscription.reconstitute({
      id: entity.id,
      userId,
      packetId,
      stripeCustomerId: entity.stripeCustomerId,
      stripeSubscriptionId: entity.stripeSubscriptionId,
      stripePriceId: entity.stripePriceId,
      status: entity.status,
      currentPeriodEnd: entity.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: entity.cancelAtPeriodEnd ?? false,
      tier: entity.tier,
      canceledAt: entity.canceledAt ?? null,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(subscription: Subscription): SubscriptionEntity {
    const json = subscription.toJSON();
    return new SubscriptionEntity({
      id: json.id,
      user: this.em.getReference(UserEntity, json.userId),
      packet: this.em.getReference(PacketEntity, json.packetId),
      stripeCustomerId: json.stripeCustomerId,
      stripeSubscriptionId: json.stripeSubscriptionId,
      stripePriceId: json.stripePriceId,
      tier: json.tier,
      status: json.status,
      currentPeriodEnd: json.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: json.cancelAtPeriodEnd,
      canceledAt: json.canceledAt ?? null,
      metadata: json.metadata,
    });
  }

  applyDomainToEntity(
    subscription: Subscription,
    entity: SubscriptionEntity,
  ): SubscriptionEntity {
    const json = subscription.toJSON();
    entity.user = this.em.getReference(UserEntity, json.userId);
    entity.packet = this.em.getReference(PacketEntity, json.packetId);
    entity.stripeCustomerId = json.stripeCustomerId;
    entity.stripeSubscriptionId = json.stripeSubscriptionId;
    entity.stripePriceId = json.stripePriceId;
    entity.status = json.status;
    entity.currentPeriodEnd = json.currentPeriodEnd ?? null;
    entity.cancelAtPeriodEnd = json.cancelAtPeriodEnd;
    entity.canceledAt = json.canceledAt ?? null;
    entity.metadata = json.metadata;
    return entity;
  }
}
