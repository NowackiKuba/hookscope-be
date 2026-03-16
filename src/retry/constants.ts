export const Token = {
  RetryRepository: Symbol('RetryRepository'),
  RetryQueue: Symbol('RetryQueue'),
} as const;

export const RETRY_DELAY_MAP: Map<number, number> = new Map();

RETRY_DELAY_MAP.set(1, 30000);
RETRY_DELAY_MAP.set(2, 120000);
RETRY_DELAY_MAP.set(3, 600000);
RETRY_DELAY_MAP.set(4, 3600000);
RETRY_DELAY_MAP.set(5, 86400000);
