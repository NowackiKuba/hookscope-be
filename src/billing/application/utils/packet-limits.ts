import type { Packet } from '@billing/domain/aggregates/packet';
import type { Subscription } from '@billing/domain/aggregates/subscription';

export type PacketLimits = {
  requestsPerMonth: number | null;
  endpoints: number | null;
  historyHours: number | null;
  retry: boolean;
  forwarding: boolean;
  manualRetry: boolean;
};

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

export function packetToLimits(packet: Packet): PacketLimits {
  const features = packet.toJSON().features;
  return {
    requestsPerMonth: parseAbbrevNumber(features['Requests / month'] ?? ''),
    endpoints: parseAbbrevNumber(features.Endpoints ?? ''),
    historyHours: parseHistoryToHours(features.History),
    retry: parseYesNo(features.Retry),
    forwarding: parseYesNo(features.Forwarding),
    manualRetry: parseYesNo(features['Manual retry']),
  };
}

export function subscriptionPeriod(params: {
  packet: Packet;
  subscription: Subscription | null;
  now?: Date;
}): { start: Date; end: Date } {
  const now = params.now ?? new Date();
  const interval = params.packet.toJSON().interval;
  const subEnd = params.subscription?.toJSON().currentPeriodEnd ?? null;
  const end =
    subEnd ??
    (interval === 'year' ? startOfNextYearUtc(now) : startOfNextMonthUtc(now));
  const start =
    interval === 'year' ? addYearsUtc(end, -1) : addMonthsUtc(end, -1);
  return { start, end };
}

