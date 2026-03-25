export type UsageStatsResponseDto = {
  period: {
    start: string;
    end: string;
  };
  subscription: {
    id: string;
    status: string;
    packetId: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  currentPacket: {
    id: string;
    name: string;
    description: string;
    unitAmount: number;
    currency: string;
    interval: 'month' | 'year';
    features: Record<string, string | boolean>;
    limits: {
      requestsPerMonth: number | null;
      endpoints: number | null;
      historyHours: number | null;
      retry: boolean;
      forwarding: boolean;
      manualRetry: boolean;
    };
  };
  usage: {
    requestsThisPeriod: number;
    endpoints: number;
    retentionDays: number;
    teamMembers: number;
  };
  packets: Array<{
    id: string;
    name: string;
    description: string;
    unitAmount: number;
    currency: string;
    interval: 'month' | 'year';
    features: Record<string, string | boolean>;
    isActive: boolean;
  }>;
};
