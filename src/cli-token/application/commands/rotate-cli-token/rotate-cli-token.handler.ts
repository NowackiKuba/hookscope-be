import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RotateCLITokenCommand } from './rotate-cli-token.command';
import { CLITokenRepositoryPort } from '@cli-token/domain/ports/outbound/persistence/repositories/cli-token.repository.port';
import { Inject } from '@nestjs/common';
import { Token } from '@cli-token/constants';
import { Token as AuthToken, DEFAULT_SALT } from '@auth/constants';
import { CLITokenId } from '@cli-token/domain/value-objects/cli-token-id.vo';
import { randomBytes } from 'crypto';
import { HashServicePort } from '@auth/domain/ports/services/hash.service.port';
import { LoggerProvider } from '@shared/constants';
import type { Logger } from 'winston';
import { CLITokenNotFoundException } from '@cli-token/domain/exceptions/cli-token-not-found.exception';
import { CLITokenForbiddenException } from '@cli-token/domain/exceptions/cli-token-forbidden.exception';

@CommandHandler(RotateCLITokenCommand)
export class RotateCLITokenHandler implements ICommandHandler<RotateCLITokenCommand> {
  constructor(
    @Inject(Token.CLIToken)
    private readonly cliTokenRepository: CLITokenRepositoryPort,
    @Inject(AuthToken.HashProvider)
    private readonly hashService: HashServicePort,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}

  async execute(command: RotateCLITokenCommand): Promise<string> {
    const { id, userId } = command.payload;

    this.logger.info('CLI TOKEN ROTATE START', { id, userId });

    try {
      const token = await this.cliTokenRepository.findById(CLITokenId.create(id));

      if (!token) {
        this.logger.warn('CLI TOKEN ROTATE NOT FOUND', { id, userId });
        throw new CLITokenNotFoundException(id);
      }

      if (token.userId !== userId) {
        this.logger.warn('CLI TOKEN ROTATE FORBIDDEN', {
          id,
          userId,
          tokenUserId: token.userId,
        });
        throw new CLITokenForbiddenException();
      }

      const code = randomBytes(32).toString('hex');
      const tokenRaw = `cli_${code}`;

      const prefix = tokenRaw.substring(0, 12);
      const tokenHash = await this.hashService.hash(code, DEFAULT_SALT);

      token.rotate(tokenHash, prefix);

      await this.cliTokenRepository.save(token);

      this.logger.info('CLI TOKEN ROTATE SUCCESS', { id, userId, prefix });
      return tokenRaw;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('CLI TOKEN ROTATE FAILED', { id, userId, error: message });
      throw error;
    }
  }
}
