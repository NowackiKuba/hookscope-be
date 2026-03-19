import { Inject, Injectable } from '@nestjs/common';
import { DEFAULT_EVENT_TYPE_KEY, Token } from '@endpoint/constants';
import {
  ScanContext,
  ScanServicePort,
} from '@webhook/domain/ports/outbound/persistence/services/scan.service.port';
import { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import {
  diffSchemas,
  flattenSchema,
  isSchemaDiffEmpty,
} from '@shared/utils/schema';
import { EventBus } from '@nestjs/cqrs';
import { AlertDetectedEvent } from '@webhook/domain/events/alert-detected.event';
import { AlertMetadata } from '@webhook/domain/value-objects/alert-metadata.vo';

@Injectable()
export class SchemaDriftScannerService implements ScanServicePort {
  constructor(
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async scan(context: ScanContext): Promise<void> {
    if (!context.payload) {
      return;
    }

    const flattenedPayload = flattenSchema(context.payload);
    const endpoint = await this.endpointRepository.findById(
      context.endpointId,
    );

    if (!endpoint) {
      return;
    }

    if (!endpoint.schemas) {
      return;
    }

    let targetSchema =
      endpoint.schemas[context.eventType ?? DEFAULT_EVENT_TYPE_KEY];
    const schemaKey = context.eventType ?? DEFAULT_EVENT_TYPE_KEY;

    if (!targetSchema) {
      endpoint.saveSchema(flattenedPayload, schemaKey);
      await this.endpointRepository.save(endpoint);
      return;
    }

    const diff = diffSchemas(targetSchema, flattenedPayload);

    if (!isSchemaDiffEmpty(diff)) {
      await this.eventBus.publish(
        new AlertDetectedEvent({
          type: 'schema_drift',
          endpointId: context.endpointId,
          userId: context.userId,
          metadata: AlertMetadata.schemaDrift({
            added: diff.added,
            removed: diff.removed,
            typeChanged: diff.typeChanged,
            updatedDto: null,
          }).value,
          eventType: context.eventType ?? undefined,
        })
      );
      endpoint.saveSchema(flattenedPayload, schemaKey);
      await this.endpointRepository.save(endpoint);
    }

    return;
  }
}
