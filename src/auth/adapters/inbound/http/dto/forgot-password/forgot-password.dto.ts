import { createZodDto } from '@anatine/zod-nestjs';
import { forgotPasswordSchema } from './forgot-password.schema';

export class ForgotPasswordDto extends createZodDto(forgotPasswordSchema) {}
