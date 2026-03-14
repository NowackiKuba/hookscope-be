import {
  EntityManager,
  EntityRepository,
} from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { EmailOutboxEntity } from '../entities/email-outbox.entity';
import type {
  EmailOutboxRepositoryPort,
  EmailOutboxEntry,
} from '../../../../domain/ports/email-outbox.repository.port';
import { generateUUID } from '@shared/utils/generate-uuid';

function toEntry(entity: EmailOutboxEntity): EmailOutboxEntry {
  return {
    id: entity.id,
    to: entity.to,
    subject: entity.subject,
    template: entity.template,
    context: entity.context ?? {},
    status: entity.status as 'pending' | 'sent' | 'failed',
    attempts: entity.attempts,
    maxAttempts: entity.maxAttempts,
    lastError: entity.lastError ?? undefined,
    sentAt: entity.sentAt ?? undefined,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

/** Resolve EM from current request/forked context so cron and HTTP both work. */
function getEm(fallback: EntityManager): EntityManager {
  const ctx = RequestContext.getEntityManager();
  return (ctx ?? fallback) as EntityManager;
}

@Injectable()
export class EmailOutboxRepository implements EmailOutboxRepositoryPort {
  constructor(private readonly em: EntityManager) {}

  private getRepo(): EntityRepository<EmailOutboxEntity> {
    return getEm(this.em).getRepository(EmailOutboxEntity);
  }

  async enqueue(params: {
    to: string;
    subject: string;
    template: string;
    context?: Record<string, unknown>;
    maxAttempts?: number;
  }): Promise<EmailOutboxEntry> {
    const repo = this.getRepo();
    const em = getEm(this.em);
    const entity = repo.create({
      id: generateUUID(),
      to: params.to,
      subject: params.subject,
      template: params.template,
      context: params.context ?? {},
      status: 'pending',
      attempts: 0,
      maxAttempts: params.maxAttempts ?? 5,
    });
    em.persist(entity);
    await em.flush();
    return toEntry(entity);
  }

  async getPending(limit = 50): Promise<EmailOutboxEntry[]> {
    const repo = this.getRepo();
    const entities = await repo.find(
      { status: 'pending' },
      {
        orderBy: { createdAt: 'asc' },
        limit,
      },
    );
    return entities.map(toEntry);
  }

  async markSent(id: string): Promise<void> {
    const repo = this.getRepo();
    const em = getEm(this.em);
    const entity = await repo.findOne({ id });
    if (!entity) return;
    entity.status = 'sent';
    entity.sentAt = new Date();
    entity.updatedAt = new Date();
    em.persist(entity);
    await em.flush();
  }

  async markFailed(id: string, error: string): Promise<void> {
    const repo = this.getRepo();
    const em = getEm(this.em);
    const entity = await repo.findOne({ id });
    if (!entity) return;
    entity.attempts += 1;
    entity.lastError = error;
    entity.updatedAt = new Date();
    if (entity.attempts >= entity.maxAttempts) {
      entity.status = 'failed';
    }
    em.persist(entity);
    await em.flush();
  }
}
