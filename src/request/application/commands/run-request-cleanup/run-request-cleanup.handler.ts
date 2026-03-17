import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Token } from '@request/constants';
import { RequestCleanupQueuePort } from '@request/domain/ports/outbound/queue/request-cleanup.queue.port';
import { RunRequestCleanupCommand } from './run-request-cleanup.command';

type SqlDeleteResult = {
  affectedRows?: number;
  rowCount?: number;
};

@CommandHandler(RunRequestCleanupCommand)
export class RunRequestCleanupHandler
  implements ICommandHandler<RunRequestCleanupCommand>
{
  constructor(
    private readonly em: EntityManager,
    @Inject(Token.RequestCleanupQueue)
    private readonly requestCleanupQueue: RequestCleanupQueuePort,
  ) {}

  async execute(): Promise<void> {
    const result = (await this.em.execute(`
      DELETE FROM requests r
      USING endpoints e
      JOIN user_subscriptions us ON us.user_id = e.user_id
      WHERE r.endpoint_id = e.id
      AND r.received_at < NOW() - INTERVAL '1 day' * CASE
        WHEN us.tier = 'pro' THEN 30
        WHEN us.tier = 'business' THEN 90
        ELSE 1
      END
      AND r.received_at < NOW() - INTERVAL '1 day'
      LIMIT 1000
    `)) as SqlDeleteResult;

    const deleted = result.affectedRows ?? result.rowCount ?? 0;
    if (deleted >= 1000) {
      await this.requestCleanupQueue.enqueue();
    }
  }
}
