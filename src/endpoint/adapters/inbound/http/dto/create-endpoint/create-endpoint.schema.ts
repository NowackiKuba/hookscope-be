import z from 'zod';

export const createEndpointSchema = z.strictObject({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  provider: z.enum(['stripe', 'clerk', 'github', 'shopify', 'przelewy24']),
  isActive: z.boolean().optional().default(true),
  silenceTreshold: z.coerce
    .number()
    .min(60, { message: 'Silence treshold should not be less than 60 minutes' })
    .max(10080, {
      message:
        'Silence treshold should not be greater than 10080 minutes (7 days)',
    })
    .optional()
    .default(1440),
  targetUrl: z.union([z.string().url(), z.null()]).optional().default(null),
  token: z.string(),
  secretKey: z.union([z.string(), z.null()]).optional().default(null),
});

export type CreateEndpointInput = z.input<typeof createEndpointSchema>;
``;
