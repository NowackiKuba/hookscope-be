import { Inject } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MikroORM } from '@mikro-orm/postgresql';
import { Job } from 'bullmq';
import { Token as RequestToken } from '@request/constants';
import { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { Token as EndpointToken } from '@endpoint/constants';
import { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { ScanContext } from '@webhook/domain/ports/outbound/persistence/services/scan.service.port';
import { ScannerService } from '@webhook/adapters/outbound/persistence/services/scanner.service';
import { LoggerProvider } from '@shared/constants';
import { withForkedContext } from '@shared/utils/request-context';
import { Logger } from 'winston';

export type ScanWebhookJobData = {
  requestId: string;
};

@Processor('scan-webhooks')
export class ScanWebhookProcessor extends WorkerHost {
  constructor(
    private readonly orm: MikroORM,
    private readonly scannerService: ScannerService,
    @Inject(RequestToken.RequestRepository)
    private readonly requestRepository: RequestRepositoryPort,
    @Inject(EndpointToken.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {
    super();
  }

  async process(job: Job<ScanWebhookJobData>): Promise<void> {
    await withForkedContext(this.orm, async () => {
      const { requestId } = job.data;

      const request = await this.requestRepository.findById(requestId);
      if (!request) {
        this.logger.warn(
          `Webhook scan skipped: request not found jobId=${job.id} requestId=${requestId}`,
        );
        return;
      }

      const endpoint = await this.endpointRepository.findById(
        request.endpointId,
      );
      if (!endpoint) {
        this.logger.warn(
          `Webhook scan skipped: endpoint not found jobId=${job.id} requestId=${requestId} endpointId=${request.endpointId}`,
        );
        return;
      }

      const json = request.toJSON();
      const context: ScanContext = {
        requestId: json.id,
        endpointId: json.endpointId,
        userId: endpoint.userId,
        payload: json.body ?? {},
        headers: json.headers,
        eventType: null,
        payloadHash: json.payloadHash,
        receivedAt: json.receivedAt,
      };

      const { endpointId, userId, eventType, payloadHash, receivedAt } =
        context;

      this.logger.info(
        `Webhook scan started jobId=${job.id} requestId=${requestId} endpointId=${endpointId} userId=${userId} eventType=${eventType ?? 'null'} payloadHash=${payloadHash} receivedAt=${receivedAt instanceof Date ? receivedAt.toISOString() : String(receivedAt)}`,
      );

      try {
        await this.scannerService.scanAll(context);
        this.logger.info(
          `Webhook scan completed jobId=${job.id} requestId=${requestId} endpointId=${endpointId}`,
        );
      } catch (err) {
        this.logger.error(
          `Webhook scan failed jobId=${job.id} requestId=${requestId} endpointId=${endpointId}`,
          err instanceof Error ? err.stack : String(err),
        );
        throw err;
      }
    });
  }
}
