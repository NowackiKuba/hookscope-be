import z from 'zod';
import { VALID_ENDPOINT_DIRECTORIES_COLORS } from '@endpoint/domain/value-objects/endpoint-directory-color.vo';
import { VALID_ENDPOINT_DIRECTORY_ICONS } from '@endpoint/domain/value-objects/endpoint-directory-icon.vo';

const colorTuple = VALID_ENDPOINT_DIRECTORIES_COLORS as [
  string,
  ...string[],
];
const iconTuple = VALID_ENDPOINT_DIRECTORY_ICONS as [string, ...string[]];

export const createEndpointDirectorySchema = z.strictObject({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.enum(colorTuple).optional(),
  icon: z.enum(iconTuple).optional(),
});

export type CreateEndpointDirectoryInput = z.input<
  typeof createEndpointDirectorySchema
>;
