import { z } from 'zod';

export const PAGE_INPUT_SCHEMA = z.strictObject({
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().min(0).optional(),
  cursor: z.string().optional(), // Cursor for cursor-based pagination
  orderBy: z.enum(['asc', 'desc']).optional(),
  orderByField: z.string().optional(),
});

export type PageInput = z.output<typeof PAGE_INPUT_SCHEMA>;

export const PAGE_PARAMS_SCHEMA = z.strictObject({
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().min(0).optional(),
  count: z.coerce.number().int().positive().optional(),
  totalCount: z.coerce.number().int().positive().optional(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  nextCursor: z.string().optional(), // Next cursor for cursor-based pagination
});

export type PageParams = z.output<typeof PAGE_PARAMS_SCHEMA>;
