import { createZodDto } from 'nestjs-zod';
import { GET_REQUESTS_BY_USER_ID_SCHEMA } from './get-requests-by-user-id.schema';

export class GetRequestsByUserIdDto extends createZodDto(
  GET_REQUESTS_BY_USER_ID_SCHEMA,
) {}
