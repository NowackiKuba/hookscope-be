import z from 'zod';
import { GenerationTarget } from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';

export const CREATE_ENDPOINT_SCHEMA_SCHEMA = z.strictObject({
  endpointId: z.string().uuid(),
  eventType: z.string().min(1),
  targets: z
    .array(z.nativeEnum(GenerationTarget))
    .min(1, { message: 'Select at least one generation target' })
    .transform((arr) => [...new Set(arr)]),
});
