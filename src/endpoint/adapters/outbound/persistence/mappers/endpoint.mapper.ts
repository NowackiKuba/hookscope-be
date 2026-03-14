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
      token: entity.token,
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
      token: json.token,
    });
  }
}
