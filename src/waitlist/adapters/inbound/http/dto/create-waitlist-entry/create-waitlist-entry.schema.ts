import { z } from 'zod';

export const createWaitlistEntrySchema = z.strictObject({
  email: z.string().email('Invalid email format'),
  source: z.string().max(200).optional(),
});

export type CreateWaitlistEntryInput = z.infer<typeof createWaitlistEntrySchema>;
