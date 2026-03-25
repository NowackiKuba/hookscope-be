import type { Packet } from '@billing/domain/aggregates/packet';

export type PacketResponseDto = {
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
  createdAt: string;
  updatedAt: string;
};

export function toPacketResponseDto(packet: Packet): PacketResponseDto {
  const json = packet.toJSON();
  return {
    id: json.id,
    name: json.name,
    code: json.code,
    description: json.description,
    unitAmount: json.unitAmount,
    currency: json.currency,
    interval: json.interval,
    features: json.features,
    isActive: json.isActive,
    stripeProductId: json.stripeProductId,
    stripePriceId: json.stripePriceId,
    createdAt: json.createdAt.toISOString(),
    updatedAt: json.updatedAt.toISOString(),
  };
}
