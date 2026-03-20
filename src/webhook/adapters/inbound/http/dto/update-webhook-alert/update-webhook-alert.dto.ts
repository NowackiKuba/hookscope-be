import { createZodDto } from '@anatine/zod-nestjs';
import { UPDATE_WEBHOOK_ALERT_SCHEMA } from './update-webhook-alert.schema';

export class UpdateWebhookAlertDto extends createZodDto(
  UPDATE_WEBHOOK_ALERT_SCHEMA,
) {}
