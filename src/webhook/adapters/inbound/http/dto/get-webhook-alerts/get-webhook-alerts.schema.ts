import { PAGE_INPUT_SCHEMA } from '@shared/utils/pagination';
import z from 'zod';

export const GET_WEBHOOK_ALERTS_SCHEMA = PAGE_INPUT_SCHEMA.extend({
  endpointId: z.string().uuid().optional(),
  type: z
    .enum([
      'schema_drift',
      'endpoint_error',
      'signature_failed',
      'duplicate_detected',
      'volume_spike',
      'silence_detected',
      'security_threat',
    ])
    .optional(),
  status: z.enum(['unread', 'read', 'dismissed']).optional(),
  orderByField: z
    .enum(['createdAt', 'updatedAt', 'type', 'status'])
    .optional(),
});

export type GetWebhookAlertsInput = z.input<typeof GET_WEBHOOK_ALERTS_SCHEMA>;
