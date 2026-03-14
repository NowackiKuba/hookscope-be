import z from 'zod';

export const updatePasswordSchema = z.strictObject({
  oldPassword: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
});

export type UpdatePasswordInput = z.input<typeof updatePasswordSchema>;
