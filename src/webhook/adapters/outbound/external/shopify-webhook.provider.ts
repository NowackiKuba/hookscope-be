import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { IWebhookProvider } from '../../../domain/ports/outbound/external/webhook-provider.port';
import { constantTimeEqual } from '../../../providers/utils/constant-time-equal';

@Injectable()
export class ShopifyWebhookProvider implements IWebhookProvider {
  readonly name = 'shopify';

  verify(
    payload: Buffer,
    headers: Record<string, string>,
    secret: string,
  ): boolean {
    const signature = headers['x-shopify-hmac-sha256'];
    if (!signature) {
      return false;
    }

    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('base64');

    return constantTimeEqual(expectedSignature, signature, 'base64');
  }

  extractEventType(
    _payload: Buffer,
    headers: Record<string, string>,
  ): string | null {
    return headers['x-shopify-topic'] ?? null;
  }
}
