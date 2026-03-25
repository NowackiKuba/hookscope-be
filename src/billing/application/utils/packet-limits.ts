import type { Packet } from '@billing/domain/aggregates/packet';
import type { Subscription } from '@billing/domain/aggregates/subscription';

export type PacketLimits = {
  requestsPerMonth: number | null;
  endpoints: number | null;
  historyHours: number | null;
  retry: boolean;
  forwarding: boolean;
  manualRetry: boolean;
  signatureVerification: boolean;
  schemaDriftAlerts: boolean;
  duplicateDetection: boolean;
  silenceDetection: boolean;
  inAppNotifications: boolean;
  emailNotifications: boolean;
  externalNotifications: boolean;
  dtoGeneration: boolean;
  volumeSpikeDetection: boolean;
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

function parseAbbrevNumber(value: string | boolean | undefined): number | null {
  if (typeof value === 'boolean') return null;
  const v = (value ?? '').trim().toLowerCase();
  if (v === 'unlimited' || v === '∞') return null;
  const m = v.match(/^(\d+(?:\.\d+)?)(k|m)?$/);
  if (!m) return Number.isFinite(Number(v)) ? Number(v) : null;
  const base = Number(m[1]);
  const mult = m[2] === 'k' ? 1_000 : m[2] === 'm' ? 1_000_000 : 1;
  return Math.round(base * mult);
}

function parseYesNo(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  const v = (value ?? '').trim().toLowerCase();
  return v === 'yes' || v === 'true' || v === '1';
}

function parseHistoryToHours(
  value: string | boolean | undefined,
): number | null {
  if (typeof value === 'boolean') return null;
  const v = (value ?? '').trim().toLowerCase();
  if (!v) return null;
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
    requestsPerMonth: parseAbbrevNumber(features['Requests / month']),
    endpoints: parseAbbrevNumber(features['Endpoints']),
    historyHours: parseHistoryToHours(features['Request history']),
    retry: parseYesNo(features['Retry']),
    forwarding: parseYesNo(features['Forwarding']),
    manualRetry: parseYesNo(features['Manual retry']),
    signatureVerification: parseYesNo(features['Signature verification']),
    schemaDriftAlerts: parseYesNo(features['Schema drift alerts']),
    duplicateDetection: parseYesNo(features['Duplicate detection']),
    silenceDetection: parseYesNo(features['Silence detection']),
    inAppNotifications: parseYesNo(features['In-app notifications']),
    emailNotifications: parseYesNo(features['Email notifications']),
    externalNotifications: parseYesNo(
      features['Slack / Discord notifications'],
    ),
    dtoGeneration: parseYesNo(features['DTO generation']),
    volumeSpikeDetection: parseYesNo(features['Volume spike detection']),
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
