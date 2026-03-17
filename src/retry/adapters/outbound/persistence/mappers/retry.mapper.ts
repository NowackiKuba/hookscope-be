import { Injectable } from '@nestjs/common';
import { Retry } from '@retry/domain/aggregates/retry';
import { RetryEntity } from '@retry/adapters/outbound/persistence/entities/retry.entity';
import { RequestEntity } from '@request/adapters/outbound/persistence/entities/request.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { RequestMapper } from '@request/adapters/outbound/persistence/mappers/request.mapper';

@Injectable()
export class RetryMapper {
  constructor(
    private readonly em: EntityManager,
    private readonly requestMapper: RequestMapper,
  ) {}
  toDomain(entity: RetryEntity): Retry {
    const requestId = entity.request?.id;
    if (!requestId) {
      throw new Error('RetryEntity must have request populated');
    }
    return new Retry({
      id: entity.id,
      requestId,
      targetUrl: entity.targetUrl,
      request: requestId ? this.requestMapper.toDomain(entity.request) : null,
      status: entity.status,
      attemptCount: entity.attemptCount,
      lastAttemptAt: entity.lastAttemptAt,
      nextAttemptAt: entity.nextAttemptAt,
      responseStatus: entity.responseStatus,
      responseBody: entity.responseBody,
      customBody: entity.customBody,
      customHeaders: entity.customHeaders,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toEntity(domain: Retry): RetryEntity {
    const domainJSON = domain.toJSON();
    return new RetryEntity({
      ...domainJSON,
      request: this.em.getReference(RequestEntity, domainJSON.requestId),
    });
  }
}
