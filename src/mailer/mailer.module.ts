import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MailerService } from './mailer.service';
import { EmailOutboxEntity } from './adapters/outbound/persistence/entities/email-outbox.entity';
import { EmailOutboxRepository } from './adapters/outbound/persistence/repositories/email-outbox.repository';
import { EmailOutboxProcessor } from './email-outbox.processor';
import { MAILER_TOKEN } from './constants';
import type { EmailOutboxRepositoryPort } from './domain/ports/email-outbox.repository.port';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([EmailOutboxEntity])],
  providers: [
    MailerService,
    EmailOutboxRepository,
    {
      provide: MAILER_TOKEN.EmailOutboxRepository,
      useExisting: EmailOutboxRepository,
    },
    EmailOutboxProcessor,
  ],
  exports: [MailerService, MAILER_TOKEN.EmailOutboxRepository],
})
export class MailerModule {}
