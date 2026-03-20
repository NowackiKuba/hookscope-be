import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EndpointSchema } from '@endpoint/domain/aggregates/endpoint-schema';
import { EndpointSchemaEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint-schema.entity';
import { EndpointEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint.entity';

@Injectable()
export class EndpointSchemaMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: EndpointSchemaEntity): EndpointSchema {
    return EndpointSchema.reconstitute({
      id: entity.id,
      endpointId: entity.endpoint.id,
      eventType: entity.eventType ?? null,
      version: entity.version,
      isLatest: entity.isLatest,
      schema: entity.schema,
      generated: entity.generated,
      generatedAt: entity.generatedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toEntity(
    schema: EndpointSchema,
    prevVersionEntity: EndpointSchemaEntity | null,
  ): EndpointSchemaEntity {
    const json = schema.toJSON();
    return new EndpointSchemaEntity({
      id: json.id,
      endpoint: this.em.getReference(EndpointEntity, json.endpointId),
      eventType: json.eventType,
      version: json.version,
      isLatest: json.isLatest,
      prevVersion: prevVersionEntity,
      schema: json.schema,
      generated: json.generated,
      generatedAt: json.generatedAt,
    });
  }
}
