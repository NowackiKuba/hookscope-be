import z from 'zod';

export const UPDATE_WEBHOOK_ALERT_SCHEMA = z.strictObject({
  status: z.enum(['unread', 'read', 'dismissed']).optional(),
  scannerStatus: z.enum(['active', 'resolved']).optional(),
});

export type UpdateWebhookAlertInput = z.input<
  typeof UPDATE_WEBHOOK_ALERT_SCHEMA
>;
