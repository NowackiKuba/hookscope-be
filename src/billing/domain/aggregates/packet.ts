import { generateUUID } from '@shared/utils/generate-uuid';

export type PacketProps = {
  id?: string;
  name: string;
  code: string;
  description?: string;
  unitAmount: number;
  currency: string;
  interval: 'month' | 'year';
  features: Record<string, string | boolean>;
  isActive?: boolean;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PacketJSON = {
  id: string;
  name: string;
  code: string;
  description: string;
  unitAmount: number;
  currency: string;
  interval: 'month' | 'year';
  features: Record<string, string | boolean>;
  isActive: boolean;
  stripeProductId: string | null;
  stripePriceId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Packet {
  private _id: string;
  private _name: string;
  private _code: string;
  private _description: string;
  private _unitAmount: number;
  private _currency: string;
  private _interval: 'month' | 'year';
  private _features: Record<string, string | boolean>;
  private _isActive: boolean;
  private _stripeProductId: string | null;
  private _stripePriceId: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: PacketProps) {
    this._id = props.id ?? generateUUID();
    this._name = props.name;
    this._code = props.code;
    this._description = props.description ?? '';
    this._unitAmount = props.unitAmount;
    this._currency = props.currency;
    this._interval = props.interval;
    this._features = props.features ?? {};
    this._isActive = props.isActive ?? true;
    this._stripeProductId = props.stripeProductId ?? null;
    this._stripePriceId = props.stripePriceId ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: PacketProps): Packet {
    return new Packet(props);
  }

  static reconstitute(props: PacketProps & { id: string }): Packet {
    return new Packet(props);
  }

  get id(): string {
    return this._id;
  }

  toJSON(): PacketJSON {
    return {
      id: this._id,
      name: this._name,
      code: this._code,
      description: this._description,
      unitAmount: this._unitAmount,
      currency: this._currency,
      interval: this._interval,
      features: this._features,
      isActive: this._isActive,
      stripeProductId: this._stripeProductId,
      stripePriceId: this._stripePriceId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
