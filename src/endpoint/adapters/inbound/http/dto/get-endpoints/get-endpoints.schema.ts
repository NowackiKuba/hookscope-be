import { PAGE_INPUT_SCHEMA } from '@shared/utils/pagination';
import z from 'zod';

export const GET_ENDPOINTS_SCHEMA = PAGE_INPUT_SCHEMA.extend({
  isActive: z.coerce.boolean().optional(),
  provider: z.string().optional(),
  directory: z.string().optional(),
});

export type GetEndpointsInput = z.input<typeof GET_ENDPOINTS_SCHEMA>;
