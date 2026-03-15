import { Injectable } from '@nestjs/common';
import { Endpoint } from '@endpoint/domain/aggregates/endpoint';
import { EndpointEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint.entity';

@Injectable()
export class EndpointMapper {
  toDomain(entity: EndpointEntity): Endpoint {
    return Endpoint.reconstitute({
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      description: entity.description,
      token: entity.token,
      isActive: entity.isActive,
      targetUrl: entity.targetUrl,
      webhookUrl: entity.webhookUrl,
      secretKey: entity.secretKey,
      requestCount: entity.requestCount,
      lastRequestAt: entity.lastRequestAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(endpoint: Endpoint): EndpointEntity {
    const json = endpoint.toJSON();
    return new EndpointEntity({
      id: json.id,
      userId: json.userId,
      name: json.name,
      description: json.description,
      token: json.token,
      isActive: json.isActive,
      targetUrl: json.targetUrl,
      webhookUrl: json.webhookUrl,
      secretKey: json.secretKey,
      requestCount: json.requestCount,
      lastRequestAt: json.lastRequestAt,
    });
  }
}
