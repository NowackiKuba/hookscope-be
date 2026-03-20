import { createZodDto } from '@anatine/zod-nestjs';
import { CREATE_ENDPOINT_SCHEMA_SCHEMA } from './create-endpoint-schema.schema';

export class CreateEndpiointSchemaDto extends createZodDto(
  CREATE_ENDPOINT_SCHEMA_SCHEMA,
) {}
