import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Optional } from '@nestjs/common';
import { CreateWaitlistEntryCommand } from './create-waitlist-entry.command';
import { WaitlistRepositoryPort } from '@waitlist/domain/ports/outbound/persistence/repositories/waitlist.repository.port';
import { Token } from '@waitlist/constants';
import { Waitlist } from '@waitlist/domain/aggregates/waitlist';
import { WaitlistEmail } from '@waitlist/domain/value-objects/waitlist-email.vo';
import { WaitlistAlreadyExistsException } from '@waitlist/domain/exceptions/waitlist-already-exists.exception';
import { WaitlistValidationException } from '@waitlist/domain/exceptions/waitlist-validation.exception';
import { MAILER_TOKEN } from '@mailer/constants';
import type { EmailOutboxRepositoryPort } from '@mailer/domain/ports/email-outbox.repository.port';

@CommandHandler(CreateWaitlistEntryCommand)
export class CreateWaitlistEntryHandler
  implements ICommandHandler<CreateWaitlistEntryCommand>
{
  constructor(
    @Inject(Token.WaitlistRepository)
    private readonly waitlistRepository: WaitlistRepositoryPort,
    @Optional()
    @Inject(MAILER_TOKEN.EmailOutboxRepository)
    private readonly emailOutbox: EmailOutboxRepositoryPort | null,
  ) {}

  async execute(command: CreateWaitlistEntryCommand): Promise<string> {
    const { email: rawEmail, source } = command.payload;

    let emailVo: WaitlistEmail;
    try {
      emailVo = WaitlistEmail.create(rawEmail);
    } catch {
      throw new WaitlistValidationException('Invalid email format');
    }

    const alreadyExists = await this.waitlistRepository.existsByEmail(emailVo);
    if (alreadyExists) {
      throw new WaitlistAlreadyExistsException(emailVo.value);
    }

    const waitlist = Waitlist.create({
      email: emailVo.value,
      source: source ?? null,
    });

    const created = await this.waitlistRepository.create(waitlist);

    if (this.emailOutbox) {
      try {
        await this.emailOutbox.enqueue({
          to: created.email.value,
          subject: "You're on the list",
          template: 'waitlist-entry',
          context: {
            email: created.email.value,
            source: created.source.value ?? undefined,
          },
        });
      } catch {
        // Non-fatal: entry is created, only confirmation email failed
      }
    }

    return created.id.value;
  }
}
