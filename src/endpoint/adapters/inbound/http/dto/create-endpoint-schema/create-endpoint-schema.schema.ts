import z from 'zod';

export const CREATE_ENDPOINT_SCHEMA_SCHEMA = z.strictObject({
  endpointId: z.string().uuid(),
  schema: z.record(z.string(), z.unknown()),
});
