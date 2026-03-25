import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { generateUUID } from '@shared/utils/generate-uuid';

export type PacketEntityProps = {
  id?: string;
  /**
   * Display name (e.g. "Starter", "Pro").
   * Prefer keeping this stable; use `code` for internal references.
   */
  name: string;
  /** Internal stable identifier (e.g. "starter", "pro"). */
  code: string;
  /** Human readable summary shown in UI. */
  description?: string;

  /** Price in smallest currency unit (e.g. cents). */
  unitAmount: number;
  currency: string;
  /** Stripe billing interval: month/year. */
  interval: 'month' | 'year';

  features: Record<string, string | boolean>;
  isActive?: boolean;

  stripeProductId?: string | null;
  stripePriceId?: string | null;
};

@Entity({ tableName: 'packets' })
export class PacketEntity extends BaseEntity implements PacketEntityProps {
  @Property({ type: 'text' })
  name!: string;

  @Property({ type: 'text', unique: true })
  code!: string;

  @Property({ type: 'text', default: '' })
  description: string = '';

  @Property({ type: 'int', fieldName: 'unit_amount' })
  unitAmount!: number;

  @Property({ type: 'text' })
  currency!: string;

  @Property({ type: 'text' })
  interval!: 'month' | 'year';

  @Property({ type: 'jsonb' })
  features: Record<string, string | boolean> = {};

  @Property({ type: 'boolean', default: true, fieldName: 'is_active' })
  isActive: boolean = true;

  @Property({ type: 'text', nullable: true, fieldName: 'stripe_product_id' })
  stripeProductId: string | null = null;

  @Property({ type: 'text', nullable: true, fieldName: 'stripe_price_id' })
  stripePriceId: string | null = null;

  constructor(props: PacketEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.name = props.name;
    this.code = props.code;
    this.description = props.description ?? '';
    this.unitAmount = props.unitAmount;
    this.currency = props.currency;
    this.interval = props.interval;
    this.features = props.features ?? {};
    this.isActive = props.isActive ?? true;
    this.stripeProductId = props.stripeProductId ?? null;
    this.stripePriceId = props.stripePriceId ?? null;
  }
}
