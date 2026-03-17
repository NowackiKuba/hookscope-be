import { generateUUID } from '@shared/utils/generate-uuid';

export type SubscriptionProps = {
  id?: string;
  userId: string;
  packetId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: string;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
  metadata?: Record<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SubscriptionJSON = {
  id: string;
  userId: string;
  packetId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  metadata?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
};

export class Subscription {
  private _id: string;
  private _userId: string;
  private _packetId: string;
  private _stripeCustomerId: string;
  private _stripeSubscriptionId: string;
  private _stripePriceId: string;
  private _status: string;
  private _currentPeriodEnd: Date | null;
  private _cancelAtPeriodEnd: boolean;
  private _canceledAt: Date | null;
  private _metadata?: Record<string, string>;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: SubscriptionProps) {
    this._id = props.id ?? generateUUID();
    this._userId = props.userId;
    this._packetId = props.packetId;
    this._stripeCustomerId = props.stripeCustomerId;
    this._stripeSubscriptionId = props.stripeSubscriptionId;
    this._stripePriceId = props.stripePriceId;
    this._status = props.status;
    this._currentPeriodEnd = props.currentPeriodEnd ?? null;
    this._cancelAtPeriodEnd = props.cancelAtPeriodEnd ?? false;
    this._canceledAt = props.canceledAt ?? null;
    this._metadata = props.metadata;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static reconstitute(props: SubscriptionProps & { id: string }): Subscription {
    return new Subscription(props);
  }

  toJSON(): SubscriptionJSON {
    return {
      id: this._id,
      userId: this._userId,
      packetId: this._packetId,
      stripeCustomerId: this._stripeCustomerId,
      stripeSubscriptionId: this._stripeSubscriptionId,
      stripePriceId: this._stripePriceId,
      status: this._status,
      currentPeriodEnd: this._currentPeriodEnd,
      cancelAtPeriodEnd: this._cancelAtPeriodEnd,
      canceledAt: this._canceledAt,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

