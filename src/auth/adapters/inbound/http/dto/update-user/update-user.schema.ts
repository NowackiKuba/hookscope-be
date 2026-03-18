import z from 'zod';

export const updateUserSchema = z.strictObject({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  avatarUrl: z.string().min(1).optional(),
});

export type UpdateUserInput = z.input<typeof updateUserSchema>;

