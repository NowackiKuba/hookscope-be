import { PAGE_INPUT_SCHEMA } from '@shared/utils/pagination';
import z from 'zod';

export const GET_NOTIFICATIONS_SCHEMA = PAGE_INPUT_SCHEMA.extend({
  channel: z.enum(['inApp', 'email', 'slack']).optional(),
  status: z.enum(['sent', 'read', 'archived', 'failed']).optional(),
  orderByField: z.enum(['createdAt', 'updatedAt', 'sentAt']).optional(),
});

export type GetNotificationsInput = z.input<typeof GET_NOTIFICATIONS_SCHEMA>;
