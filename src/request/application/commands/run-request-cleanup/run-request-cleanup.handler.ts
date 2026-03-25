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
export class RunRequestCleanupHandler implements ICommandHandler<RunRequestCleanupCommand> {
  constructor(
    private readonly em: EntityManager,
    @Inject(Token.RequestCleanupQueue)
    private readonly requestCleanupQueue: RequestCleanupQueuePort,
  ) {}

  async execute(): Promise<void> {
    const result = (await this.em.execute(`
      DELETE FROM requests
WHERE id IN (
  SELECT r.id
  FROM requests r
  JOIN endpoints e ON e.id = r.endpoint_id
  JOIN (
    SELECT
      e2.id AS endpoint_id,
      COALESCE(
        (
          SELECT
            CASE
              WHEN p.features->>'Request history' ~ '^[0-9]+\s*(d|day|days)$'
                THEN (regexp_match(p.features->>'Request history', '^([0-9]+)'))[1]::int * 24
              WHEN p.features->>'Request history' ~ '^[0-9]+\s*h$'
                THEN (regexp_match(p.features->>'Request history', '^([0-9]+)'))[1]::int
              ELSE NULL
            END
          FROM subscriptions s
          JOIN packets p ON p.id = s.packet_id
          WHERE s.user_id = e2.user_id
          LIMIT 1
        ),
        (
          SELECT
            CASE
              WHEN p.features->>'Request history' ~ '^[0-9]+\s*(d|day|days)$'
                THEN (regexp_match(p.features->>'Request history', '^([0-9]+)'))[1]::int * 24
              WHEN p.features->>'Request history' ~ '^[0-9]+\s*h$'
                THEN (regexp_match(p.features->>'Request history', '^([0-9]+)'))[1]::int
              ELSE NULL
            END
          FROM packets p
          WHERE p.code = 'free'
          LIMIT 1
        )
      ) AS retention_hours
    FROM endpoints e2
  ) retention ON retention.endpoint_id = e.id
  WHERE retention.retention_hours IS NOT NULL
    AND r.received_at < NOW() - (retention.retention_hours || ' hours')::interval
  LIMIT 1000
)
    `)) as SqlDeleteResult;

    const deleted = result.affectedRows ?? result.rowCount ?? 0;
    if (deleted >= 1000) {
      await this.requestCleanupQueue.enqueue();
    }
  }
}
