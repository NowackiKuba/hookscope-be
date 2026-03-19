import { Inject, Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Token } from '@request/constants';
import { Token as EndpointToken } from '@endpoint/constants';
import { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Cron } from '@nestjs/schedule';
import { AlertDetectedEvent } from '@webhook/domain/events/alert-detected.event';
import { AlertMetadata } from '@webhook/domain/value-objects/alert-metadata.vo';

const HOURLY_WINDOW_MS = 60 * 60 * 1000;
const BASELINE_DAYS = 7;
const HOURS_IN_DAY = 24;
const SPIKE_THRESHOLD_MULTIPLIER = 3;

@Injectable()
export class VolumeSpikeScannerCron {
  constructor(
    @Inject(Token.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(EndpointToken.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  @Cron('*/15 * * * *')
  async process() {
    const endpoints = await this.endpointRepository.getAll();
    const activeEndpoints = endpoints.filter((endpoint) => endpoint.isActive);

    if (activeEndpoints.length === 0) {
      return;
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - HOURLY_WINDOW_MS);
    const sevenDaysAgo = new Date(
      now.getTime() - BASELINE_DAYS * HOURS_IN_DAY * HOURLY_WINDOW_MS,
    );

    const [currentCounts, baselineCounts] = await Promise.all([
      this.requestRepository.countByEndpointInPeriod(oneHourAgo, now),
      this.requestRepository.countByEndpointInPeriod(sevenDaysAgo, now),
    ]);

    const currentByEndpoint = new Map(
      currentCounts.map((row) => [row.endpointId, row.count]),
    );
    const baselineByEndpoint = new Map(
      baselineCounts.map((row) => [row.endpointId, row.count]),
    );

    const avgDivider = BASELINE_DAYS * HOURS_IN_DAY;

    await Promise.all(
      activeEndpoints.map(async (endpoint) => {
        const currentRate = currentByEndpoint.get(endpoint.id) ?? 0;
        const sevenDaysCount = baselineByEndpoint.get(endpoint.id) ?? 0;
        const normalRate = sevenDaysCount / avgDivider;

        if (normalRate <= 0) {
          return;
        }

        const threshold = normalRate * SPIKE_THRESHOLD_MULTIPLIER;
        if (currentRate <= threshold) {
          return;
        }

        const multiplier = currentRate / normalRate;
        await this.eventBus.publish(
          new AlertDetectedEvent({
            type: 'volume_spike',
            endpointId: endpoint.id,
            userId: endpoint.userId,
            metadata: AlertMetadata.volumeSpike({
              normalRate,
              currentRate,
              multiplier,
            }).value,
          }),
        );
      }),
    );
  }
}
