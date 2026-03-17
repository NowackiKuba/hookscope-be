import z from 'zod';

export const RUN_RETRY_MANUALLY_SCHEMA = z.strictObject({
  body: z.unknown().optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

export type RunRetryManuallyInput = z.input<typeof RUN_RETRY_MANUALLY_SCHEMA>;
