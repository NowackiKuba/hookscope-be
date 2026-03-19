import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { IWebhookProvider } from '../../../domain/ports/outbound/external/webhook-provider.port';
import { constantTimeEqual } from '../../../providers/utils/constant-time-equal';

@Injectable()
export class GitHubWebhookProvider implements IWebhookProvider {
  readonly name = 'github';

  verify(
    payload: Buffer,
    headers: Record<string, string>,
    secret: string,
  ): boolean {
    const signatureHeader = headers['x-hub-signature-256'];
    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
      return false;
    }

    const signature = signatureHeader.slice('sha256='.length);
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return constantTimeEqual(expectedSignature, signature, 'hex');
  }

  extractEventType(
    _payload: Buffer,
    headers: Record<string, string>,
  ): string | null {
    return headers['x-github-event'] ?? null;
  }
}
