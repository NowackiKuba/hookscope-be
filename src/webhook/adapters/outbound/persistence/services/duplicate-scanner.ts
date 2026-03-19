import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Token } from '@request/constants';
import { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { AlertDetectedEvent } from '@webhook/domain/events/alert-detected.event';
import {
  ScanContext,
  ScanServicePort,
} from '@webhook/domain/ports/outbound/persistence/services/scan.service.port';
import { AlertMetadata } from '@webhook/domain/value-objects/alert-metadata.vo';

@Injectable()
export class DuplicateScanner implements ScanServicePort {
  constructor(
    @Inject(Token.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async scan(context: ScanContext): Promise<void> {
    const duplicates = await this.requestRepository.findByPayloadHash(
      context.payloadHash,
      context.requestId,
      30,
    );

    if (duplicates.length > 0) {
      await this.eventBus.publish(
        new AlertDetectedEvent({
          type: 'duplicate_detected',
          endpointId: context.endpointId,
          metadata: AlertMetadata.duplicateDetected({
            duplicateRequestId: duplicates[0].id,
            originalRequestId: context.requestId,
          }).value,
          userId: context.userId,
          eventType: context.eventType,
        }),
      );
    }
  }
}
