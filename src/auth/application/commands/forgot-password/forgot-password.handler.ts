import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from './forgot-password.command';
import { UserRepositoryPort } from '@users/domain/ports/repositories/user.repository.port';
import { Inject, Optional } from '@nestjs/common';
import { Token as UsersToken } from '@users/constants';
import { MAILER_TOKEN } from '@mailer/constants';
import { EmailOutboxRepositoryPort } from '@mailer/domain/ports/email-outbox.repository.port';
import { Email } from '@users/domain/value-objects/user-email.vo';
import { generateResetPasswordToken } from '@shared/utils/generate-reset-password-token';
import { addMinutes } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import type { Config } from '@config/config.schema';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  constructor(
    @Inject(UsersToken.UserRepository)
    private readonly userRepository: UserRepositoryPort,
    @Optional()
    @Inject(MAILER_TOKEN.EmailOutboxRepository)
    private readonly emailOutbox: EmailOutboxRepositoryPort | null,
    private readonly configService: ConfigService<Config, true>,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    const user = await this.userRepository.getByEmail(
      Email.create(command.payload.email),
    );

    if (!user) {
      return;
    }

    const token = generateResetPasswordToken();

    user.onForgotPassword(token, addMinutes(new Date(), 30));

    await this.userRepository.update(user);

    if (this.emailOutbox) {
      const origin = this.configService.get('ORIGIN', { infer: true });
      const resetUrl = `${origin}/auth/reset-password?token=${token}`;
      await this.emailOutbox.enqueue({
        to: command.payload.email,
        subject: 'Password reset link',
        template: 'forgot-password',
        context: {
          name: `${user.firstName}`.trim(),
          email: command.payload.email,
          resetUrl,
        },
      });
    }
  }
}
