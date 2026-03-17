import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsageStatsQuery } from './get-usage-stats.query';
import { GetPacketsQuery } from '@billing/application/queries/get-packets/get-packets.query';
import { GetMySubscriptionQuery } from '@billing/application/queries/get-my-subscription/get-my-subscription.query';
import { Token as BillingToken } from '@billing/constants';
import type { PacketRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/packet.repository.port';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token as RequestToken } from '@request/constants';
import { Token as EndpointToken } from '@endpoint/constants';
import type { UsageStatsResponseDto } from '@usage/adapters/inbound/http/dto/usage-stats-response.dto';
import type { Packet } from '@billing/domain/aggregates/packet';
import type { Subscription } from '@billing/domain/aggregates/subscription';
import {
  packetToLimits,
  subscriptionPeriod,
} from '@billing/application/utils/packet-limits';

@QueryHandler(GetUsageStatsQuery)
export class GetUsageStatsHandler implements IQueryHandler<GetUsageStatsQuery> {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(BillingToken.PacketRepository)
    private readonly packetsRepo: PacketRepositoryPort,
    @Inject(RequestToken.RequestRepository)
    private readonly requestsRepo: RequestRepositoryPort,
    @Inject(EndpointToken.EndpointRepository)
    private readonly endpointsRepo: EndpointRepositoryPort,
  ) {}

  async execute(query: GetUsageStatsQuery): Promise<UsageStatsResponseDto> {
    const { userId } = query.payload;

    const [packets, subscription] = (await Promise.all([
      this.queryBus.execute(new GetPacketsQuery()),
      this.queryBus.execute(new GetMySubscriptionQuery(userId)),
    ])) as [Packet[], Subscription | null];

    const currentPacket = subscription
      ? await this.packetsRepo.findById(subscription.toJSON().packetId)
      : await this.packetsRepo.findByCode('free');

    const packet = currentPacket ?? packets[0];
    const packetJson = packet.toJSON();
    const limits = packetToLimits(packet);
    const { start, end } = subscriptionPeriod({ packet, subscription });

    const [requestsThisPeriod, endpointsUsed] = await Promise.all([
      this.requestsRepo.countByUserIdInPeriod(userId, start, end),
      this.endpointsRepo.countByUserId(userId),
    ]);

    const retentionDays = Math.max(
      1,
      Math.ceil((limits.historyHours ?? 24) / 24),
    );

    const subJson = subscription?.toJSON() ?? null;

    return {
      period: { start: start.toISOString(), end: end.toISOString() },
      subscription: subJson
        ? {
            id: subJson.id,
            status: subJson.status,
            packetId: subJson.packetId,
            currentPeriodEnd: subJson.currentPeriodEnd?.toISOString() ?? null,
            cancelAtPeriodEnd: subJson.cancelAtPeriodEnd,
          }
        : null,
      currentPacket: {
        id: packetJson.id,
        name: packetJson.name,
        description: packetJson.description,
        unitAmount: packetJson.unitAmount,
        currency: packetJson.currency,
        interval: packetJson.interval,
        features: packetJson.features,
        limits,
      },
      usage: {
        requestsThisPeriod,
        endpoints: endpointsUsed,
        retentionDays,
        teamMembers: 1,
      },
      packets: packets.map((p) => {
        const j = p.toJSON();
        return {
          id: j.id,
          name: j.name,
          description: j.description,
          unitAmount: j.unitAmount,
          currency: j.currency,
          interval: j.interval,
          features: j.features,
          isActive: j.isActive,
        };
      }),
    };
  }
}

