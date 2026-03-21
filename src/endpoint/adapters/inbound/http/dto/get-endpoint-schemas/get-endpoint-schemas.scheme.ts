import { PAGE_INPUT_SCHEMA } from '@shared/utils/pagination';
import z from 'zod';

export const GET_ENDPOINT_SCHEMAS_SCHEME = PAGE_INPUT_SCHEMA.extend({
  isLatest: z.coerce.boolean().optional(),
  eventType: z.string().optional(),
});

export type GetEndpointSchemasInput = z.input<
  typeof GET_ENDPOINT_SCHEMAS_SCHEME
>;
