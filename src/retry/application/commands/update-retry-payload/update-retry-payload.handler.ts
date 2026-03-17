import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Token } from '@retry/constants';
import type { RetryRepositoryPort } from '@retry/domain/ports/repositories/retry.repository.port';
import { UpdateRetryPayloadCommand } from './update-retry-payload.command';
import { UserId } from '@users/domain/value-objects/user-id.vo';
import { RetryNotFoundException } from '@retry/domain/exceptions';
import type { Retry } from '@retry/domain/aggregates/retry';

@CommandHandler(UpdateRetryPayloadCommand)
export class UpdateRetryPayloadHandler
  implements ICommandHandler<UpdateRetryPayloadCommand>
{
  constructor(
    @Inject(Token.RetryRepository)
    private readonly retryRepository: RetryRepositoryPort,
  ) {}

  async execute(command: UpdateRetryPayloadCommand): Promise<Retry> {
    const retry = await this.retryRepository.findByIdAndUserId(
      command.retryId,
      UserId.create(command.userId),
    );
    if (!retry) {
      throw new RetryNotFoundException(command.retryId);
    }

    retry.updatePayload(command.body, command.headers);
    await this.retryRepository.save(retry);
    return retry;
  }
}

