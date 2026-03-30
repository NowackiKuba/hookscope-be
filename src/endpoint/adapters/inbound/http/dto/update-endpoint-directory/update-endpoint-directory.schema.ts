import z from 'zod';
import { VALID_ENDPOINT_DIRECTORIES_COLORS } from '@endpoint/domain/value-objects/endpoint-directory-color.vo';
import { VALID_ENDPOINT_DIRECTORY_ICONS } from '@endpoint/domain/value-objects/endpoint-directory-icon.vo';

const colorTuple = VALID_ENDPOINT_DIRECTORIES_COLORS as [
  string,
  ...string[],
];
const iconTuple = VALID_ENDPOINT_DIRECTORY_ICONS as [string, ...string[]];

export const updateEndpointDirectorySchema = z
  .strictObject({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    color: z.union([z.enum(colorTuple), z.literal('')]).optional(),
    icon: z.union([z.enum(iconTuple), z.literal('')]).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.color !== undefined ||
      data.icon !== undefined,
    { message: 'At least one field is required', path: ['name'] },
  );

export type UpdateEndpointDirectoryInput = z.input<
  typeof updateEndpointDirectorySchema
>;
