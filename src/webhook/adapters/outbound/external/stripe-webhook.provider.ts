import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { IWebhookProvider } from '../../../domain/ports/outbound/external/webhook-provider.port';
import { constantTimeEqual } from '../../../providers/utils/constant-time-equal';

@Injectable()
export class StripeWebhookProvider implements IWebhookProvider {
  readonly name = 'stripe';

  verify(
    payload: Buffer,
    headers: Record<string, string>,
    secret: string,
  ): boolean {
    const header = headers['stripe-signature'];
    if (!header) {
      return false;
    }

    const parsed = this.parseStripeSignature(header);
    if (!parsed?.timestamp || !parsed.signature) {
      return false;
    }

    const timestamp = Number(parsed.timestamp);
    const now = Math.floor(Date.now() / 1000);
    if (
      Number.isNaN(timestamp) ||
      now - timestamp > 5 * 60 ||
      timestamp - now > 5 * 60
    ) {
      return false;
    }

    const signedPayload = `${parsed.timestamp}.${payload.toString('utf8')}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return constantTimeEqual(expectedSignature, parsed.signature, 'hex');
  }

  private parseStripeSignature(header: string) {
    const parts = header.split(',');
    const values = new Map<string, string[]>();

    for (const part of parts) {
      const [key, value] = part.trim().split('=');
      if (!key || !value) {
        continue;
      }

      const existing = values.get(key) ?? [];
      existing.push(value);
      values.set(key, existing);
    }

    return {
      timestamp: values.get('t')?.[0],
      signature: values.get('v1')?.[0],
    };
  }

  extractEventType(payload: Buffer): string | null {
    try {
      const parsed = JSON.parse(payload.toString('utf8')) as { type?: unknown };
      return typeof parsed.type === 'string' ? parsed.type : null;
    } catch {
      return null;
    }
  }
}
