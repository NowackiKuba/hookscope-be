import { createZodDto } from '@anatine/zod-nestjs';
import { GET_ENDPOINTS_SCHEMA } from './get-endpoints.schema';

export class GetEndpointsDto extends createZodDto(GET_ENDPOINTS_SCHEMA) {}
