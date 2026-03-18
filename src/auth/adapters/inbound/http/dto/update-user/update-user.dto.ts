import { createZodDto } from '@anatine/zod-nestjs';
import { updateUserSchema } from './update-user.schema';

export class UpdateUserDto extends createZodDto(updateUserSchema) {}

