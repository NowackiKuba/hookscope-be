import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { IWebhookProvider } from '../domain/interfaces/webhook-provider.interface';
import { constantTimeEqual } from './utils/constant-time-equal';

type Przelewy24Payload = {
  crc?: string;
};

@Injectable()
export class Przelewy24WebhookProvider implements IWebhookProvider {
  readonly name = 'przelewy24';

  verify(
    payload: Buffer,
    headers: Record<string, string>,
    secret: string,
  ): boolean {
    const signature = headers['x-header-signature'];
    if (!signature) {
      return false;
    }

    let parsedPayload: Przelewy24Payload;
    try {
      parsedPayload = JSON.parse(payload.toString('utf8')) as Przelewy24Payload;
    } catch {
      return false;
    }

    if (!parsedPayload.crc) {
      return false;
    }

    // TODO: Confirm header name/signing formula against current Przelewy24 docs.
    const expectedSignature = createHash('sha384')
      .update(`${payload.toString('utf8')}|${parsedPayload.crc}|${secret}`)
      .digest('hex');

    return constantTimeEqual(expectedSignature, signature, 'hex');
  }
}
