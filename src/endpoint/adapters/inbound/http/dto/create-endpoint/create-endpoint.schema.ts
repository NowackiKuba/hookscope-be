import z from 'zod';

export const createEndpointSchema = z.strictObject({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  provider: z.enum(['stripe', 'clerk', 'github', 'shopify', 'przelewy24']),
  isActive: z.boolean().optional().default(true),
  targetUrl: z.union([z.string().url(), z.null()]).optional().default(null),
  secretKey: z.union([z.string(), z.null()]).optional().default(null),
});

export type CreateEndpointInput = z.input<typeof createEndpointSchema>;
