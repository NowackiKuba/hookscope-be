import { createZodDto } from '@anatine/zod-nestjs';
import { GET_WEBHOOK_ALERTS_SCHEMA } from './get-webhook-alerts.schema';

export class GetWebhookAlertsDto extends createZodDto(
  GET_WEBHOOK_ALERTS_SCHEMA,
) {}
