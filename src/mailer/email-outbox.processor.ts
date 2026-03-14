import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MikroORM } from '@mikro-orm/core';
import { MailerService } from './mailer.service';
import type { EmailOutboxRepositoryPort } from './domain/ports/email-outbox.repository.port';
import { MAILER_TOKEN } from './constants';
import { withForkedContext } from '@shared/utils/request-context';

//
@Injectable()
export class EmailOutboxProcessor {
  private readonly logger = new Logger(EmailOutboxProcessor.name);

  constructor(
    private readonly orm: MikroORM,
    private readonly mailer: MailerService,
    @Inject(MAILER_TOKEN.EmailOutboxRepository)
    private readonly outbox: EmailOutboxRepositoryPort,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processPending(): Promise<void> {
    await withForkedContext(this.orm, async () => {
      const pending = await this.outbox.getPending(20);
      if (pending.length === 0) return;

      for (const entry of pending) {
        try {
          await this.mailer.sendMail({
            to: entry.to,
            subject: entry.subject,
            template: entry.template,
            context: entry.context,
          });
          await this.outbox.markSent(entry.id);
          this.logger.debug(`Outbox email sent: ${entry.id} -> ${entry.to}`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          await this.outbox.markFailed(entry.id, message);
          this.logger.warn(
            `Outbox email failed: ${entry.id} -> ${entry.to}, attempts=${entry.attempts + 1}: ${message}`,
          );
        }
      }
    });
  }
}
