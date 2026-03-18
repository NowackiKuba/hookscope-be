import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from './update-user.command';
import { Inject } from '@nestjs/common';
import { Token } from '@users/constants';
import type { UserRepositoryPort } from '@users/domain/ports/outbound/persistence/repositories/user.repository.port';
import { UserId } from '@users/domain/value-objects/user-id.vo';
import { LoggerProvider } from '@shared/constants';
import type { Logger } from 'winston';
import { UserNotFoundException } from '@auth/domain/exceptions';
import { UsernameAlreadyExistsException } from '@users/domain/exceptions/username-already-exists.exception';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(Token.UserRepository)
    private readonly userRepository: UserRepositoryPort,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}

  async execute(command: UpdateUserCommand): Promise<string> {
    const { id, username } = command.payload;
    this.logger.info('USER UPDATE START', { userId: id, username });

    try {
      const user = await this.userRepository.getById(UserId.create(id));

      if (!user) {
        this.logger.warn('USER UPDATE NOT FOUND', { userId: id });
        throw new UserNotFoundException(id);
      }

      if (typeof username === 'string') {
        const existing = await (this.userRepository as any).getByUsername(
          username,
        );
        if (existing && existing.id.value !== user.id.value) {
          this.logger.warn('USER UPDATE USERNAME CONFLICT', {
            userId: id,
            username,
            existingUserId: existing.id.value,
          });
          throw new UsernameAlreadyExistsException(username);
        }
      }

      user.update(command.payload);

      await this.userRepository.update(user);

      this.logger.info('USER UPDATE SUCCESS', { userId: user.id.value });
      return user.id.value;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('USER UPDATE FAILED', { userId: id, error: message });
      throw error;
    }
  }
}
