import {
  BadRequestException,
  Inject,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Token } from '@webhook/constants';
import { WebhookAlert } from '@webhook/domain/aggreagates/webhook-alert';
import { WebhookAlertRepositoryPort } from '@webhook/domain/ports/outbound/persistence/repositories/webhook-alert.repository.port';
import { CreateWebhookAlertCommand } from './create-webhook-alert.command';

function requireNonEmptyString(
  value: string | undefined,
  fieldName: string,
): string {
  if (value == null || String(value).trim() === '') {
    throw new BadRequestException(`${fieldName} is required`);
  }
  return String(value).trim();
}

@CommandHandler(CreateWebhookAlertCommand)
export class CreateWebhookAlertHandler implements ICommandHandler<CreateWebhookAlertCommand> {
  private readonly logger = new Logger(CreateWebhookAlertHandler.name);

  constructor(
    @Inject(Token.WebhookAlertRepository)
    private readonly webhookAlertRepository: WebhookAlertRepositoryPort,
  ) {}

  async execute(command: CreateWebhookAlertCommand): Promise<string> {
    const p = command.payload;

    const id = requireNonEmptyString(p.id, 'id');
    const endpointId = requireNonEmptyString(p.endpointId, 'endpointId');
    const userId = requireNonEmptyString(p.userId, 'userId');
    const type = requireNonEmptyString(p.type, 'type');
    const status = requireNonEmptyString(p.status, 'status');

    let alert: WebhookAlert;
    try {
      alert = WebhookAlert.create({
        id,
        endpointId,
        userId,
        type,
        status,
        eventType: p.eventType,
        metadata: p.metadata,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid webhook alert data';
      this.logger.warn(
        `CreateWebhookAlert: domain validation failed for alert id=${id}: ${message}`,
      );
      throw new BadRequestException(message);
    }

    try {
      const saved = await this.webhookAlertRepository.create(alert);
      const savedId = saved.id.value;
      this.logger.log(
        `Webhook alert created: id=${savedId} type=${type} status=${status} endpointId=${endpointId}`,
      );
      return savedId;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown persistence error';
      this.logger.error(
        `CreateWebhookAlert: failed to persist alert id=${id}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to persist webhook alert');
    }
  }
}
