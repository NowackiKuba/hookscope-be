import { EntityManager, EntityRepository, FilterQuery } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import {
  EndpointSchemaRepositoryPort,
} from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-schema.repository.port';
import { EndpointSchemaEntity } from '../entities/endpoint-schema.entity';
import type { EndpointSchemaGeneratedValue } from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';
import { EndpointSchema } from '@endpoint/domain/aggregates/endpoint-schema';
import { EndpointSchemaMapper } from '../mappers/endpoint-schema.mapper';

@Injectable()
export class EndpointSchemaRepository implements EndpointSchemaRepositoryPort {
  private readonly dbSource: EntityRepository<EndpointSchemaEntity>;

  constructor(
    private readonly em: EntityManager,
    private readonly mapper: EndpointSchemaMapper,
  ) {
    this.dbSource = this.em.getRepository(EndpointSchemaEntity);
  }

  async getLatest(
    endpointId: string,
    eventType?: string | null,
  ): Promise<EndpointSchema | null> {
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

    return latest ? this.mapper.toDomain(latest) : null;
  }

  async createNextVersion(params: {
    endpointId: string;
    eventType?: string | null;
    schema: Record<string, string>;
    generated?: EndpointSchemaGeneratedValue;
  }): Promise<EndpointSchema> {
    const { endpointId, eventType, schema, generated } = params;
    const normalizedEventType = eventType ?? null;

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

    const domain = EndpointSchema.create({
      endpointId,
      eventType: normalizedEventType,
      version: latest ? latest.version + 1 : 1,
      schema,
      generated,
    });

    const entity = this.mapper.toEntity(domain, latest);
    this.em.persist(entity);
    await this.em.flush();
    await this.em.populate(entity, ['endpoint']);

    return this.mapper.toDomain(entity);
  }

  async getByEndpointId(
    endpointId: string,
    eventType?: string | null,
  ): Promise<EndpointSchema[]> {
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
    return rows.map((row) => this.mapper.toDomain(row));
  }
}
