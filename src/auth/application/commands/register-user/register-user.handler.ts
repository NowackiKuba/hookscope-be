import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterUserCommand } from './register-user.command';
import { HashServicePort } from '@auth/domain/ports/services/hash.service.port';
import { Inject, InternalServerErrorException, Optional } from '@nestjs/common';
import { DEFAULT_SALT, Token } from '@auth/constants';
import { generateUUID } from '@shared/utils/generate-uuid';
import { CreateUserCommand } from '@users/application/commands/create-user/create-user.command';
import { LoggerProvider } from '@shared/constants';
import { Logger } from 'winston';
import { MAILER_TOKEN } from '@mailer/constants';
import type { EmailOutboxRepositoryPort } from '@mailer/domain/ports/email-outbox.repository.port';
import { ConfigService } from '@nestjs/config';
import type { Config } from '@config/config.schema';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(Token.HashProvider)
    private readonly hashService: HashServicePort,
    private readonly commandBus: CommandBus,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
    @Optional()
    @Inject(MAILER_TOKEN.EmailOutboxRepository)
    private readonly emailOutbox: EmailOutboxRepositoryPort | null,
    private readonly config: ConfigService<Config, true>,
  ) {}

  async execute(command: RegisterUserCommand): Promise<string> {
    const id = generateUUID();
    let hashedPassword: string;
    try {
      hashedPassword = await this.hashService.hash(
        command.payload.password,
        DEFAULT_SALT,
      );
    } catch (error) {
      this.logger.error(
        `RegisterUserHandler: Failed to hash password for email ${command.payload.email}: ${error instanceof Error ? error.message : error}`,
        { stack: error instanceof Error ? error.stack : undefined },
      );
      throw new InternalServerErrorException(
        'An error occurred during password hashing.',
      );
    }

    try {
      const userId: string = await this.commandBus.execute(
        new CreateUserCommand({
          id,
          firstName: command.payload.firstName,
          lastName: command.payload.lastName,
          email: command.payload.email,
          password: hashedPassword,
        }),
      );
      this.logger.info(
        `RegisterUserHandler: Successfully registered new user with email: ${command.payload.email}, id: ${id}`,
      );

      if (this.emailOutbox) {
        const origin = this.config.get('ORIGIN', { infer: true });
        const loginUrl = `${origin}/login`;
        try {
          await this.emailOutbox.enqueue({
            to: command.payload.email,
            subject: 'Welcome to Revoply 🎉',
            template: 'welcome',
            context: {
              name: [command.payload.firstName, command.payload.lastName]
                .filter(Boolean)
                .join(' ')
                .trim() || 'User',
              loginUrl,
            },
          });
        } catch (e) {
          this.logger.warn(
            `RegisterUserHandler: Failed to enqueue welcome email: ${e instanceof Error ? e.message : e}`,
          );
        }
      }

      return userId;
    } catch (error) {
      this.logger.error(
        `RegisterUserHandler: Failed to register user with email ${command.payload.email}: ${error instanceof Error ? error.message : error}`,
        { stack: error instanceof Error ? error.stack : undefined },
      );
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while registering the user.',
      );
    }
  }
}
