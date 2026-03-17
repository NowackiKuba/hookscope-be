import { PAGE_INPUT_SCHEMA } from '@shared/utils/pagination';
import z from 'zod';

export const GET_RETRIES_SCHEMA = PAGE_INPUT_SCHEMA.extend({
  requestId: z.string().uuid().optional(),
  status: z.enum(['pending', 'success', 'failed', 'cancelled']).optional(),
});

export type GetRetriesInput = z.input<typeof GET_RETRIES_SCHEMA>;
