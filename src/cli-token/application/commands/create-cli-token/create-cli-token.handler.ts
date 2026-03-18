import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCLITokenCommand } from './create-cli-token.command';
import { Inject } from '@nestjs/common';
import { Token } from '@cli-token/constants';
import { Token as AuthToken, DEFAULT_SALT } from '@auth/constants';
import { CLITokenRepositoryPort } from '@cli-token/domain/ports/outbound/persistence/repositories/cli-token.repository.port';
import { HashServicePort } from '@auth/domain/ports/services/hash.service.port';
import { randomBytes } from 'crypto';
import { CLIToken } from '@cli-token/domain/aggregates/cli-token';
import { LoggerProvider } from '@shared/constants';
import type { Logger } from 'winston';
import { CLITokenAlreadyExistsException } from '@cli-token/domain/exceptions/cli-token-already-exists.exception';

@CommandHandler(CreateCLITokenCommand)
export class CreateCLITokenHandler implements ICommandHandler<CreateCLITokenCommand> {
  constructor(
    @Inject(Token.CLIToken)
    private readonly cliTokenRepository: CLITokenRepositoryPort,
    @Inject(AuthToken.HashProvider)
    private readonly hashService: HashServicePort,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}

  async execute(command: CreateCLITokenCommand): Promise<string> {
    const { userId, id } = command.payload;

    this.logger.info('CLI TOKEN CREATE START', { userId, id });

    try {
      const existing = await this.cliTokenRepository.findByUserId(userId);
      if (existing) {
        this.logger.warn('CLI TOKEN ALREADY EXISTS', {
          userId,
          existingId: existing.id.value,
        });
        throw new CLITokenAlreadyExistsException(userId);
      }

      const code = randomBytes(32).toString('hex');
      const token = `cli_${code}`;

      const prefix = token.substring(0, 12);
      const tokenHash = await this.hashService.hash(code, DEFAULT_SALT);

      const cliToken = CLIToken.create({
        prefix,
        tokenHash,
        userId,
        id,
      });

      await this.cliTokenRepository.save(cliToken);

      this.logger.info('CLI TOKEN CREATE SUCCESS', { userId, id, prefix });
      return token;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('CLI TOKEN CREATE FAILED', {
        userId,
        id,
        error: message,
      });
      throw error;
    }
  }
}
