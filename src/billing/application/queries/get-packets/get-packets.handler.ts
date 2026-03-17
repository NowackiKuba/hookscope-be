import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Token } from '@billing/constants';
import type { PacketRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/packet.repository.port';
import { Packet } from '@billing/domain/aggregates/packet';
import { GetPacketsQuery } from './get-packets.query';

@QueryHandler(GetPacketsQuery)
export class GetPacketsHandler implements IQueryHandler<GetPacketsQuery> {
  constructor(
    @Inject(Token.PacketRepository)
    private readonly packets: PacketRepositoryPort,
  ) {}

  async execute(): Promise<Packet[]> {
    return await this.packets.findAllActive();
  }
}

