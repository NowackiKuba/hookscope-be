import { PAGE_INPUT_SCHEMA } from '@shared/utils/pagination';
import z from 'zod';

export const GET_ENDPOINT_DIRECTORIES_SCHEME = PAGE_INPUT_SCHEMA;

export type GetEndpointDirectoriesInput = z.input<
  typeof GET_ENDPOINT_DIRECTORIES_SCHEME
>;
