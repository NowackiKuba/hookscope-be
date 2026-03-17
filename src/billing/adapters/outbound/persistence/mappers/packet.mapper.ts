import { Injectable } from '@nestjs/common';
import { PacketEntity } from '../entities/packet.entity';
import { Packet } from '@billing/domain/aggregates/packet';

@Injectable()
export class PacketMapper {
  toDomain(entity: PacketEntity): Packet {
    return Packet.reconstitute({
      id: entity.id,
      name: entity.name,
      code: entity.code,
      description: entity.description,
      unitAmount: entity.unitAmount,
      currency: entity.currency,
      interval: entity.interval,
      features: entity.features ?? {},
      isActive: entity.isActive,
      stripeProductId: entity.stripeProductId ?? null,
      stripePriceId: entity.stripePriceId ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(packet: Packet): PacketEntity {
    const json = packet.toJSON();
    return new PacketEntity({
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
    });
  }
}

