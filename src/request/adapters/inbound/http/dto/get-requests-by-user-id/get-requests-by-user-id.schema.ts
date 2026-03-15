import { PAGE_INPUT_SCHEMA } from '@shared/utils/pagination';
import z from 'zod';

export const GET_REQUESTS_BY_USER_ID_SCHEMA = PAGE_INPUT_SCHEMA.extend({
  method: z.string().optional(),
  overlimit: z.coerce.boolean().optional(),
  forwardedStatus: z.coerce.number().optional(),
  endpointId: z.string().optional(),
});

export type GetRequestsByUserIdInput = z.input<
  typeof GET_REQUESTS_BY_USER_ID_SCHEMA
>;
