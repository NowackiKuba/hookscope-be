import { Inject, Injectable, Logger } from '@nestjs/common';
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
import { EndpointSchemaRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-schema.repository.port';
import { EndpointSchemaCodeGenerationService } from '@endpoint/application/services/endpoint-schema-code-generation.service';
import type { EndpointSchemaGeneratedValue } from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';

@Injectable()
export class SchemaDriftScannerService implements ScanServicePort {
  private readonly logger = new Logger(SchemaDriftScannerService.name);

  constructor(
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    @Inject(Token.EndpointSchemaRepository)
    private readonly endpointSchemaRepository: EndpointSchemaRepositoryPort,
    private readonly eventBus: EventBus,
    private readonly codeGeneration: EndpointSchemaCodeGenerationService,
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

    const schemaKey = context.eventType ?? DEFAULT_EVENT_TYPE_KEY;
    const latestSchema = await this.endpointSchemaRepository.getLatest(
      context.endpointId,
      schemaKey,
    );
    const targetSchema = latestSchema?.schema;

    if (!targetSchema) {
      const generated = await this.tryGenerateArtifacts(
        context.userId,
        flattenedPayload,
      );
      await this.endpointSchemaRepository.createNextVersion({
        endpointId: context.endpointId,
        eventType: schemaKey,
        schema: flattenedPayload,
        generated,
      });
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
      const generated = await this.tryGenerateArtifacts(
        context.userId,
        flattenedPayload,
      );
      await this.endpointSchemaRepository.createNextVersion({
        endpointId: context.endpointId,
        eventType: schemaKey,
        schema: flattenedPayload,
        generated,
      });
      endpoint.saveSchema(flattenedPayload, schemaKey);
      await this.endpointRepository.save(endpoint);
    }

    return;
  }

  private async tryGenerateArtifacts(
    userId: string,
    flattenedSchema: Record<string, string>,
  ): Promise<EndpointSchemaGeneratedValue | undefined> {
    try {
      return await this.codeGeneration.generateArtifacts(
        userId,
        flattenedSchema,
      );
    } catch (err) {
      this.logger.warn(
        `Schema code generation failed for user ${userId}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return undefined;
    }
  }
}
