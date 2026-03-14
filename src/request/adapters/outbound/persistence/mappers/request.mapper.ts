import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EndpointEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint.entity';
import { Request } from '@request/domain/aggregates/request';
import { RequestEntity } from '@request/adapters/outbound/persistence/entities/request.entity';

@Injectable()
export class RequestMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: RequestEntity): Request {
    const endpointId =
      entity.endpoint?.id ?? (entity as unknown as { endpoint_id?: string }).endpoint_id ?? '';
    return Request.reconstitute({
      id: entity.id,
      endpointId,
      method: entity.method,
      headers: entity.headers ?? {},
      body: entity.body as Record<string, unknown> | null,
      query: entity.query ?? {},
      ip: entity.ip,
      contentType: entity.contentType,
      size: entity.size,
      overlimit: entity.overlimit,
      forwardStatus: entity.forwardStatus ?? null,
      forwardedAt: entity.forwardedAt ?? null,
      forwardError: entity.forwardError ?? null,
      receivedAt: entity.receivedAt,
    });
  }

  toPersistence(request: Request): RequestEntity {
    const json = request.toJSON();
    const entity = new RequestEntity();
    entity.id = json.id;
    entity.endpoint = this.em.getReference(EndpointEntity, json.endpointId);
    entity.method = json.method;
    entity.headers = json.headers;
    entity.body = json.body;
    entity.query = json.query;
    entity.forwardStatus = json.forwardStatus ?? null;
    entity.forwardedAt = json.forwardedAt ?? null;
    entity.forwardError = json.forwardError ?? null;
    entity.ip = json.ip;
    entity.contentType = json.contentType;
    entity.size = json.size;
    entity.overlimit = json.overlimit;
    entity.receivedAt = json.receivedAt;
    return entity;
  }
}
