import { ScanContext } from './scan.service.port';

export interface ScannerServicePort {
  scanAll(context: ScanContext): Promise<void>;
}
