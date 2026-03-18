import z from 'zod';

export const resetPasswordSchema = z.strictObject({
  token: z.string().min(1),
  newPassword: z.string().min(1),
});

export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;

