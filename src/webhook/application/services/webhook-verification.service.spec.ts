import { createHash, createHmac } from 'crypto';
import { WebhookVerificationService } from './webhook-verification.service';
import { GitHubWebhookProvider } from '../../providers/github-webhook.provider';
import { Przelewy24WebhookProvider } from '../../providers/przelewy24-webhook.provider';
import { ShopifyWebhookProvider } from '../../providers/shopify-webhook.provider';
import { StripeWebhookProvider } from '../../providers/stripe-webhook.provider';

describe('WebhookVerificationService', () => {
  const providers = [
    new StripeWebhookProvider(),
    new GitHubWebhookProvider(),
    new ShopifyWebhookProvider(),
    new Przelewy24WebhookProvider(),
  ];
  const service = new WebhookVerificationService(providers);

  it('verifies Stripe signatures with timestamped payload', () => {
    const payload = Buffer.from('{"event":"charge.succeeded"}');
    const secret = 'stripe_secret';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signedPayload = `${timestamp}.${payload.toString('utf8')}`;
    const signature = createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    const result = service.verify(
      'stripe',
      payload,
      { 'stripe-signature': `t=${timestamp},v1=${signature}` },
      secret,
    );

    expect(result).toBe(true);
  });

  it('verifies GitHub signatures with sha256 header format', () => {
    const payload = Buffer.from('{"action":"opened"}');
    const secret = 'github_secret';
    const signature = createHmac('sha256', secret).update(payload).digest('hex');

    const result = service.verify(
      'github',
      payload,
      { 'x-hub-signature-256': `sha256=${signature}` },
      secret,
    );

    expect(result).toBe(true);
  });

  it('verifies Shopify signatures with base64-encoded hmac', () => {
    const payload = Buffer.from('{"topic":"orders/create"}');
    const secret = 'shopify_secret';
    const signature = createHmac('sha256', secret)
      .update(payload)
      .digest('base64');

    const result = service.verify(
      'shopify',
      payload,
      { 'x-shopify-hmac-sha256': signature },
      secret,
    );

    expect(result).toBe(true);
  });

  it('verifies Przelewy24 signatures using crc from payload', () => {
    const payloadObject = {
      crc: 'p24_crc',
      amount: 12345,
      orderId: 'ord_1',
    };
    const payload = Buffer.from(JSON.stringify(payloadObject));
    const secret = 'przelewy24_secret';
    const signature = createHash('sha384')
      .update(`${payload.toString('utf8')}|${payloadObject.crc}|${secret}`)
      .digest('hex');

    const result = service.verify(
      'przelewy24',
      payload,
      { 'x-header-signature': signature },
      secret,
    );

    expect(result).toBe(true);
  });
});
