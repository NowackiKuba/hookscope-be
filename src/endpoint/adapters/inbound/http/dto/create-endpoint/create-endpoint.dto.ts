/**
 * Plain DTO to avoid circular dependency with Swagger/zod-nestjs metadata on "targetUrl".
 * Validate with createEndpointSchema (e.g. in controller or ZodValidationPipe).
 */
export class CreateEndpointDto {
  name!: string;
  description?: string;
  isActive?: boolean;
  targetUrl?: string | null;
  secretKey?: string | null;
}
