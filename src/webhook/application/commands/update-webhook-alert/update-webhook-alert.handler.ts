import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateWebhookAlertCommand } from './update-webhok-alert.command';
import { WebhookAlertRepositoryPort } from '@webhook/domain/ports/outbound/persistence/repositories/webhook-alert.repository.port';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { Token } from '@webhook/constants';
import { WebhookAlertId } from '@webhook/domain/value-objects/webhook-alert-id.vo';
import { WebhookAlertNotFoundException } from '@webhook/domain/exceptions';

@CommandHandler(UpdateWebhookAlertCommand)
export class UpdateWebhookAlertHandler implements ICommandHandler<UpdateWebhookAlertCommand> {
  constructor(
    @Inject(Token.WebhookAlertRepository)
    private readonly webhookAlertRepository: WebhookAlertRepositoryPort,
  ) {}

  async execute(command: UpdateWebhookAlertCommand): Promise<string> {
    const alert = await this.webhookAlertRepository.getById(
      WebhookAlertId.create(command.payload.id),
    );

    if (!alert) {
      throw new WebhookAlertNotFoundException(alert.id.value);
    }

    if (alert.userId !== command.payload.userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this webhook alert.',
      );
    }

    alert.update(command.payload.status, command.payload.scannerStatus);

    await this.webhookAlertRepository.update(alert);

    return alert.id.value;
  }
}
