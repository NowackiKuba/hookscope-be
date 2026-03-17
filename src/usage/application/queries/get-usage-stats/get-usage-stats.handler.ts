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

function addMonthsUtc(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
  ).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

function addYearsUtc(date: Date, years: number): Date {
  const d = new Date(date.getTime());
  const month = d.getUTCMonth();
  d.setUTCFullYear(d.getUTCFullYear() + years);
  // handle Feb 29 -> Feb 28 on non-leap years by clamping day
  if (d.getUTCMonth() !== month) {
    d.setUTCDate(0);
  }
  return d;
}

function startOfNextMonthUtc(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

function startOfNextYearUtc(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
}

function parseAbbrevNumber(value: string): number | null {
  const v = value.trim().toLowerCase();
  if (v === 'unlimited' || v === '∞') return null;
  const m = v.match(/^(\d+(?:\.\d+)?)(k|m)?$/);
  if (!m) return Number.isFinite(Number(v)) ? Number(v) : null;
  const base = Number(m[1]);
  const mult = m[2] === 'k' ? 1_000 : m[2] === 'm' ? 1_000_000 : 1;
  return Math.round(base * mult);
}

function parseYesNo(value: string | undefined): boolean {
  const v = (value ?? '').trim().toLowerCase();
  if (v === 'yes' || v === 'true' || v === '1') return true;
  return false;
}

function parseHistoryToHours(value: string | undefined): number | null {
  const v = (value ?? '').trim().toLowerCase();
  if (!v) return null;
  // examples: "24h", "30d", "30 days"
  const h = v.match(/^(\d+)\s*h$/);
  if (h) return Number(h[1]);
  const d = v.match(/^(\d+)\s*(d|day|days)$/);
  if (d) return Number(d[1]) * 24;
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

function packetToLimits(features: Record<string, string>): {
  requestsPerMonth: number | null;
  endpoints: number | null;
  historyHours: number | null;
  retry: boolean;
  forwarding: boolean;
  manualRetry: boolean;
} {
  const requestsPerMonth = parseAbbrevNumber(features['Requests / month'] ?? '');
  const endpoints = parseAbbrevNumber(features.Endpoints ?? '');
  const historyHours = parseHistoryToHours(features.History);
  const retry = parseYesNo(features.Retry);
  const forwarding = parseYesNo(features.Forwarding);
  const manualRetry = parseYesNo(features['Manual retry']);
  return {
    requestsPerMonth,
    endpoints,
    historyHours,
    retry,
    forwarding,
    manualRetry,
  };
}

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

    const packetJson = (currentPacket ?? packets[0]).toJSON();
    const limits = packetToLimits(packetJson.features);

    const now = new Date();
    const subPeriodEnd = subscription?.toJSON().currentPeriodEnd ?? null;
    const end =
      subPeriodEnd ??
      (packetJson.interval === 'year'
        ? startOfNextYearUtc(now)
        : startOfNextMonthUtc(now));
    const start =
      packetJson.interval === 'year'
        ? addYearsUtc(end, -1)
        : addMonthsUtc(end, -1);

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

