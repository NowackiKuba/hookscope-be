import { createZodDto } from '@anatine/zod-nestjs';
import { GET_RETRIES_SCHEMA } from './get-retries.schema';

export class GetRetriesDto extends createZodDto(GET_RETRIES_SCHEMA) {}
