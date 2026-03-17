import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { LoggerProvider } from '@shared/constants';
import { Logger } from 'winston';
import { RunRequestCleanupCommand } from '@request/application/commands/run-request-cleanup/run-request-cleanup.command';

@Processor('request-cleanup')
export class RequestCleanupQueueProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.info('REQUEST CLEANUP JOB START', {
      jobId: job.id,
      jobName: job.name,
      data: job.data,
    });

    await this.commandBus.execute(new RunRequestCleanupCommand());
  }
}