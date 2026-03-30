import { createZodDto } from '@anatine/zod-nestjs';
import { GET_ENDPOINT_DIRECTORIES_SCHEME } from './get-endpoint-directories.scheme';

export class GetEndpointDirectoriesDto extends createZodDto(
  GET_ENDPOINT_DIRECTORIES_SCHEME,
) {}
