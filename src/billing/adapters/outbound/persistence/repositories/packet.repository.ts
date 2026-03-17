import { EntityManager } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { PacketEntity } from '../entities/packet.entity';
import type { PacketRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/packet.repository.port';
import { PacketMapper } from '../mappers/packet.mapper';
import { Packet } from '@billing/domain/aggregates/packet';

function getEm(fallback: EntityManager): EntityManager {
  const ctx = RequestContext.getEntityManager();
  return (ctx ?? fallback) as EntityManager;
}

@Injectable()
export class PacketRepository implements PacketRepositoryPort {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: PacketMapper,
  ) {}

  private getEm(): EntityManager {
    return getEm(this.em);
  }

  async findByCode(code: string): Promise<Packet | null> {
    const em = this.getEm();
    const entity = await em.findOne(PacketEntity, { code });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findById(id: string): Promise<Packet | null> {
    const em = this.getEm();
    const entity = await em.findOne(PacketEntity, { id });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByStripePriceId(stripePriceId: string): Promise<Packet | null> {
    const em = this.getEm();
    const entity = await em.findOne(PacketEntity, { stripePriceId });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAllActive(): Promise<Packet[]> {
    const em = this.getEm();
    const entities = await em.find(
      PacketEntity,
      { isActive: true },
      { orderBy: { unitAmount: 'asc' } },
    );
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async save(packet: Packet): Promise<Packet> {
    const em = this.getEm();
    const entity = this.mapper.toPersistence(packet);
    em.persist(entity);
    await em.flush();
    return this.mapper.toDomain(entity);
  }
}

