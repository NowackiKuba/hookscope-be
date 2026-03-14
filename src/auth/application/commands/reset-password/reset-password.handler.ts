import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Optional, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordCommand } from './reset-password.command';
import { Token as AuthToken } from '@auth/constants';
import { Token as UsersToken } from '@users/constants';
import type { UserRepositoryPort } from '@users/domain/ports/repositories/user.repository.port';
import type { HashServicePort } from '@auth/domain/ports/services/hash.service.port';
import { User } from '@users/domain/aggregates/user';
import { DEFAULT_SALT } from '@auth/constants';
import { MAILER_TOKEN } from '@mailer/constants';
import type { EmailOutboxRepositoryPort } from '@mailer/domain/ports/email-outbox.repository.port';
import type { Config } from '@config/config.schema';
import { Email } from '@users/domain/value-objects/user-email.vo';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    @Inject(UsersToken.UserRepository)
    private readonly userRepository: UserRepositoryPort,
    @Inject(AuthToken.HashProvider)
    private readonly hashService: HashServicePort,
    @Optional()
    @Inject(MAILER_TOKEN.EmailOutboxRepository)
    private readonly emailOutbox: EmailOutboxRepositoryPort | null,
    private readonly config: ConfigService<Config, true>,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    const { token, newPassword } = command.payload;

    const user = await this.userRepository.getByResetPasswordToken(token);
    if (!user) {
      throw new UnauthorizedException(
        'Invalid or expired reset link. Please request a new one.',
      );
    }

    const hashedPassword = await this.hashService.hash(
      newPassword,
      DEFAULT_SALT,
    );

    const json = user.toJSON();
    const updated = User.create({
      ...json,
      passwordHash: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
      updatedAt: new Date(),
    });
    await this.userRepository.update(updated);

    if (this.emailOutbox) {
      const origin = this.config.get('ORIGIN', { infer: true });
      const loginUrl = `${origin}/login`;
      try {
        await this.emailOutbox.enqueue({
          to: user.email.value,
          subject: 'Your password has been reset',
          template: 'reset-password',
          context: {
            name:
              [user.firstName, user.lastName]
                .filter(Boolean)
                .join(' ')
                .trim() || 'User',
            loginUrl,
          },
        });
      } catch {
        // Non-fatal: password was reset successfully
      }
    }
  }
}
