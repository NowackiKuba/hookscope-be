import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { generateUUID } from '@shared/utils/generate-uuid';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';
import { PacketEntity } from './packet.entity';

export type SubscriptionEntityProps = {
  id?: string;
  user: UserEntity;
  packet: PacketEntity;

  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;

  status: string;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;

  metadata?: Record<string, string>;
};

@Entity({ tableName: 'subscriptions' })
@Unique({ properties: ['stripeSubscriptionId'] })
@Unique({ properties: ['user'] })
export class SubscriptionEntity extends BaseEntity implements SubscriptionEntityProps {
  @ManyToOne(() => UserEntity, { fieldName: 'user_id', deleteRule: 'cascade' })
  user!: UserEntity;

  @ManyToOne(() => PacketEntity, {
    fieldName: 'packet_id',
    deleteRule: 'restrict',
  })
  packet!: PacketEntity;

  @Property({ type: 'text', fieldName: 'stripe_customer_id' })
  stripeCustomerId!: string;

  @Property({ type: 'text', fieldName: 'stripe_subscription_id' })
  stripeSubscriptionId!: string;

  @Property({ type: 'text', fieldName: 'stripe_price_id' })
  stripePriceId!: string;

  /** Stripe subscription status string (e.g. active, trialing, past_due, canceled). */
  @Property({ type: 'text' })
  status!: string;

  @Property({
    type: 'timestamptz',
    nullable: true,
    fieldName: 'current_period_end',
  })
  currentPeriodEnd: Date | null = null;

  @Property({ type: 'boolean', default: false, fieldName: 'cancel_at_period_end' })
  cancelAtPeriodEnd: boolean = false;

  @Property({ type: 'timestamptz', nullable: true, fieldName: 'canceled_at' })
  canceledAt: Date | null = null;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, string>;

  constructor(props: SubscriptionEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.user = props.user;
    this.packet = props.packet;
    this.stripeCustomerId = props.stripeCustomerId;
    this.stripeSubscriptionId = props.stripeSubscriptionId;
    this.stripePriceId = props.stripePriceId;
    this.status = props.status;
    this.currentPeriodEnd = props.currentPeriodEnd ?? null;
    this.cancelAtPeriodEnd = props.cancelAtPeriodEnd ?? false;
    this.canceledAt = props.canceledAt ?? null;
    this.metadata = props.metadata;
  }
}

