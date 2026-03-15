import { Injectable } from '@nestjs/common';
import { Retry } from '@retry/domain/aggregates/retry';
import { RetryEntity } from '@retry/adapters/outbound/persistence/entities/retry.entity';
import { RequestEntity } from '@request/adapters/outbound/persistence/entities/request.entity';
import { EntityManager } from '@mikro-orm/postgresql';

@Injectable()
export class RetryMapper {
  toDomain(entity: RetryEntity): Retry {
    const requestId = entity.request?.id;
    if (!requestId) {
      throw new Error('RetryEntity must have request populated');
    }
    return new Retry({
      id: entity.id,
      requestId,
      targetUrl: entity.targetUrl,
      status: entity.status,
      attemptCount: entity.attemptCount,
      lastAttemptAt: entity.lastAttemptAt,
      nextAttemptAt: entity.nextAttemptAt,
      responseStatus: entity.responseStatus,
      responseBody: entity.responseBody,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Retry, em: EntityManager): RetryEntity {
    const requestRef = em.getReference(RequestEntity, domain.requestId);
    const entity = new RetryEntity();
    entity.id = domain.id;
    entity.request = requestRef;
    entity.targetUrl = domain.targetUrl;
    entity.status = domain.status;
    entity.attemptCount = domain.attemptCount;
    entity.lastAttemptAt = domain.lastAttemptAt;
    entity.nextAttemptAt = domain.nextAttemptAt;
    entity.responseStatus = domain.responseStatus;
    entity.responseBody = domain.responseBody;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
