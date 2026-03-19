import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ScanContext } from '@webhook/domain/ports/outbound/persistence/services/scan.service.port';
import { ScannerServicePort } from '@webhook/domain/ports/outbound/persistence/services/scanner.service.port';
import { Job } from 'bullmq';

@Processor('webhook-scan')
export class ScanWebhookProcessor extends WorkerHost {
  constructor(private readonly scannerService: ScannerServicePort) {
    super();
  }

  async process(job: Job<ScanContext, any, string>): Promise<void> {
    await this.scannerService.scanAll(job.data);
  }
}
