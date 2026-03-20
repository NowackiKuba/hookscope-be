import { EntityManager, EntityRepository, FilterQuery } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { EndpointEntity } from '../entities/endpoint.entity';
import {
  EndpointSchemaRepositoryPort,
  EndpointSchemaVersion,
} from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-schema.repository.port';
import { EndpointSchemaEntity } from '../entities/endpoint-schema.entity';
import {
  EndpointSchemaGenerated,
  EndpointSchemaGeneratedValue,
} from '@endpoint/domain/value-objects/edpoint-schema-generated.vo';

function toVersion(entity: EndpointSchemaEntity): EndpointSchemaVersion {
  return {
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
  };
}

@Injectable()
export class EndpointSchemaRepository implements EndpointSchemaRepositoryPort {
  private readonly dbSource: EntityRepository<EndpointSchemaEntity>;

  constructor(private readonly em: EntityManager) {
    this.dbSource = this.em.getRepository(EndpointSchemaEntity);
  }

  async getLatest(
    endpointId: string,
    eventType?: string | null,
  ): Promise<EndpointSchemaVersion | null> {
    const latest = await this.dbSource.findOne(
      {
        endpoint: { id: endpointId },
        eventType: eventType ?? null,
        isLatest: true,
      } as FilterQuery<EndpointSchemaEntity>,
      {
        orderBy: { version: 'desc' },
        populate: ['endpoint'],
      },
    );

    return latest ? toVersion(latest) : null;
  }

  async createNextVersion(params: {
    endpointId: string;
    eventType?: string | null;
    schema: Record<string, string>;
    generated?: EndpointSchemaGeneratedValue;
  }): Promise<EndpointSchemaVersion> {
    const { endpointId, eventType, schema, generated } = params;
    const normalizedEventType = eventType ?? null;
    const generatedValue = EndpointSchemaGenerated.create(generated).value;

    const latest = await this.dbSource.findOne(
      {
        endpoint: { id: endpointId },
        eventType: normalizedEventType,
        isLatest: true,
      } as FilterQuery<EndpointSchemaEntity>,
      {
        orderBy: { version: 'desc' },
      },
    );

    if (latest) {
      latest.isLatest = false;
      this.em.persist(latest);
    }

    const next = this.dbSource.create(
      new EndpointSchemaEntity({
        endpoint: this.em.getReference(EndpointEntity, endpointId),
        eventType: normalizedEventType,
        version: latest ? latest.version + 1 : 1,
        isLatest: true,
        prevVersion: latest ?? null,
        schema,
        generated: generatedValue,
        generatedAt: new Date(),
      }),
    );

    this.em.persist(next);
    await this.em.flush();
    await this.em.populate(next, ['endpoint']);

    return toVersion(next);
  }

  async getByEndpointId(
    endpointId: string,
    eventType?: string | null,
  ): Promise<EndpointSchemaVersion[]> {
    const where: FilterQuery<EndpointSchemaEntity> = {
      endpoint: { id: endpointId },
    };
    if (eventType !== undefined) {
      where.eventType = eventType ?? null;
    }

    const rows = await this.dbSource.find(where, {
      orderBy: { version: 'desc' },
      populate: ['endpoint'],
    });
    return rows.map(toVersion);
  }
}
