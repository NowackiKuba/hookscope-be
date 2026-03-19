import { Inject, Injectable } from '@nestjs/common';
import { Token } from '@webhook/constants';
import {
  ScanContext,
  ScanServicePort,
} from '@webhook/domain/ports/outbound/persistence/services/scan.service.port';
import { ScannerServicePort } from '@webhook/domain/ports/outbound/persistence/services/scanner.service.port';

@Injectable()
export class ScannerService implements ScannerServicePort {
  constructor(
    @Inject(Token.DuplicateScannerService)
    private readonly duplicateScannerService: ScanServicePort,
    @Inject(Token.SchemaDriftScannerService)
    private readonly schemaDriftScannerService: ScanServicePort,
  ) {}

  async scanAll(context: ScanContext): Promise<void> {
    await Promise.all([
      this.schemaDriftScannerService.scan(context),
      this.duplicateScannerService.scan(context),
    ]);
  }
}
