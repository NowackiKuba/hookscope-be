import z from 'zod';

export const CREATE_NOTIFICATION_SCHEMA = z.strictObject({
  userId: z.string().uuid().optional(),
  referenceId: z.string().uuid(),
  payload: z.record(z.string(), z.unknown()),
  channel: z.enum(['inApp', 'email', 'slack']).optional(),
  status: z.enum(['sent', 'read', 'archived', 'failed']).optional(),
  failedReason: z.string().optional(),
  sentAt: z.coerce.date().optional(),
});

export type CreateNotificationInput = z.input<typeof CREATE_NOTIFICATION_SCHEMA>;
