import { Injectable } from '@nestjs/common';
import { Endpoint } from '@endpoint/domain/aggregates/endpoint';
import { EndpointEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';

@Injectable()
export class EndpointMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: EndpointEntity): Endpoint {
    return Endpoint.reconstitute({
      id: entity.id,
      userId: entity.user.id,
      name: entity.name,
      description: entity.description,
      provider: entity.provider,
      token: entity.token,
      isActive: entity.isActive,
      targetUrl: entity.targetUrl,
      webhookUrl: entity.webhookUrl,
      silenceTreshold: entity.silenceTreshold,
      secretKey: entity.secretKey,
      requestCount: entity.requestCount,
      lastRequestAt: entity.lastRequestAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toEntity(endpoint: Endpoint): EndpointEntity {
    const json = endpoint.toJSON();
    return new EndpointEntity({
      id: json.id,
      user: this.em.getReference(UserEntity, json.userId),
      name: json.name,
      provider: json.provider,
      description: json.description,
      token: json.token,
      isActive: json.isActive,
      targetUrl: json.targetUrl,
      webhookUrl: json.webhookUrl,
      secretKey: json.secretKey,
      silenceTreshold: json.silenceTreshold,
      requestCount: json.requestCount,
      lastRequestAt: json.lastRequestAt,
      schemas: json.schemas,
      lastSchemaAt: json.lastSchemaAt,
    });
  }
}
