import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common';
import { UpdatePasswordCommand } from './update-password.command';
import { UserRepositoryPort } from '@users/domain/ports/repositories/user.repository.port';
import { DEFAULT_SALT, Token } from '@auth/constants';
import { Token as UsersToken } from '@users/constants';
import { HashServicePort } from '@auth/domain/ports/services/hash.service.port';
import { UserNotFoundException } from '@auth/domain/exceptions';
import { UserId } from '@users/domain/value-objects/user-id.vo';
import { LoggerProvider } from '@shared/constants';
import { Logger } from 'winston';
import { DomainException } from '@shared/domain/exceptions';

const LOG_CONTEXT = 'UpdatePasswordHandler';

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordHandler implements ICommandHandler<UpdatePasswordCommand> {
  constructor(
    @Inject(UsersToken.UserRepository)
    private readonly userRepository: UserRepositoryPort,
    @Inject(Token.HashProvider)
    private readonly hashService: HashServicePort,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}

  async execute(command: UpdatePasswordCommand): Promise<string> {
    const userId = UserId.create(command.payload.id);
    const logMeta = { userId: userId.value };

    this.logger.info('Update password started', {
      ...logMeta,
      context: LOG_CONTEXT,
    });

    try {
      const user = await this.userRepository.getById(userId);

      if (!user) {
        this.logger.warn('User not found for password update', {
          ...logMeta,
          context: LOG_CONTEXT,
        });
        throw new UserNotFoundException(userId.value);
      }

      const isValidOldPassword = await this.hashService.compare(
        command.payload.oldPassword,
        user.password,
      );

      if (!isValidOldPassword) {
        this.logger.warn('Invalid current password', {
          ...logMeta,
          context: LOG_CONTEXT,
        });
        throw new UnauthorizedException('Current password is incorrect.');
      }

      if (command.payload.newPassword !== command.payload.confirmPassword) {
        this.logger.warn('New password and confirmation do not match', {
          ...logMeta,
          context: LOG_CONTEXT,
        });
        throw new BadRequestException(
          'New password and confirmation do not match.',
        );
      }

      const hashedPassword = await this.hashService.hash(
        command.payload.newPassword,
        DEFAULT_SALT,
      );

      user.updatePassword(hashedPassword);
      await this.userRepository.update(user);

      this.logger.info('Password updated successfully', {
        ...logMeta,
        context: LOG_CONTEXT,
      });

      return user.id.value;
    } catch (error) {
      if (error instanceof DomainException) {
        this.logger.warn('Update password failed (domain)', {
          ...logMeta,
          code: error.code,
          context: LOG_CONTEXT,
        });
        throw error;
      }
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Update password failed', {
        ...logMeta,
        error: error instanceof Error ? error.message : String(error),
        context: LOG_CONTEXT,
      });
      throw error;
    }
  }
}
