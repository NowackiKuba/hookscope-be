import z from 'zod';

export const forgotPasswordSchema = z.strictObject({
  email: z.string().email(),
});

export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
