import { createZodDto } from '@anatine/zod-nestjs';
import { GET_ENDPOINT_SCHEMAS_SCHEME } from './get-endpoint-schemas.scheme';

export class GetEndpointsSchemasDto extends createZodDto(
  GET_ENDPOINT_SCHEMAS_SCHEME,
) {}
