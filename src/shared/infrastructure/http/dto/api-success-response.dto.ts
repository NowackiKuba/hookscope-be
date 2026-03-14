import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * Generic API success response schema.
 * This schema wraps any data in a standardized "data" field.
 *
 * @template T - The type of data being wrapped
 */
export function createApiSuccessResponseSchema<T extends z.ZodTypeAny>(
  dataSchema: T,
) {
  return z.object({
    data: dataSchema,
  });
}

/**
 * Generic API success response DTO class.
 * Use this to create typed response DTOs for your endpoints.
 *
 * @example
 * ```typescript
 * const CreateUserResponseSchema = createApiSuccessResponseSchema(
 *   z.object({ id: z.string().uuid() })
 * );
 * export class CreateUserResponseDto extends createZodDto(CreateUserResponseSchema) {}
 * ```
 */
export class ApiSuccessResponseDto<T = unknown> extends createZodDto(
  createApiSuccessResponseSchema(z.any()),
) {
  data!: T;
}
