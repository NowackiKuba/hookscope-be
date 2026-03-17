import { Packet } from '@billing/domain/aggregates/packet';

export interface PacketRepositoryPort {
  findAllActive(): Promise<Packet[]>;
  findById(id: string): Promise<Packet | null>;
  findByCode(code: string): Promise<Packet | null>;
  findByStripePriceId(stripePriceId: string): Promise<Packet | null>;
  save(packet: Packet): Promise<Packet>;
}

