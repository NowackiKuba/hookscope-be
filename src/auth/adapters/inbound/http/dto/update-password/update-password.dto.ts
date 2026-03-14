import { createZodDto } from '@anatine/zod-nestjs';
import { updatePasswordSchema } from './update-password.schema';

export class UpdatePasswordDto extends createZodDto(updatePasswordSchema) {}
