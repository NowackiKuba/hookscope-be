import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Token } from '@retry/constants';
import { RetryRepositoryPort } from '@retry/domain/ports/repositories/retry.repository.port';
import { RetryQueuePort } from '@retry/domain/ports/outbound/queue/retry.queue.port';
import { RunRetryManuallyCommand } from './run-retry-manually.command';
import { UserId } from '@users/domain/value-objects/user-id.vo';
import { RetryNotFoundException } from '@retry/domain/exceptions';

@CommandHandler(RunRetryManuallyCommand)
export class RunRetryManuallyHandler
  implements ICommandHandler<RunRetryManuallyCommand>
{
  constructor(
    @Inject(Token.RetryRepository)
    private readonly retryRepository: RetryRepositoryPort,
    @Inject(Token.RetryQueue)
    private readonly retryQueue: RetryQueuePort,
  ) {}

  async execute(command: RunRetryManuallyCommand): Promise<{ scheduled: boolean }> {
    const retry = await this.retryRepository.findByIdAndUserId(
      command.retryId,
      UserId.create(command.userId),
    );
    if (!retry) {
      throw new RetryNotFoundException(command.retryId);
    }
    retry.updatePayload(command.body, command.headers);
    await this.retryRepository.save(retry);
    await this.retryQueue.scheduleRetry(retry.id, 0);
    return { scheduled: true };
  }
}
