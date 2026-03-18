import { createZodDto } from '@anatine/zod-nestjs';
import { resetPasswordSchema } from './reset-password.schema';

export class ResetPasswordDto extends createZodDto(resetPasswordSchema) {}

