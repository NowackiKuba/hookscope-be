import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

type RequestWithRawBody = Request & { rawBody?: Buffer };

/**
 * Middleware that preserves raw body bytes for webhook signature verification.
 *
 * Since NestJS is configured with rawBody: true globally, req.rawBody is already
 * available on all requests. This middleware simply ensures the body is not parsed
 * as JSON for webhook requests with signature headers, allowing the raw bytes to
 * be used for HMAC verification.
 *
 * For webhook requests with signature headers (stripe-signature, x-hub-signature-256,
 * x-shopify-hmac-sha256, x-header-signature, svix-signature):
 * - Skip to next middleware (rawBody already captured by NestJS)
 *
 * For non-webhook requests (without signature headers):
 * - Continue to next middleware (body will be parsed as JSON by NestJS)
 */
@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RawBodyMiddleware.name);

  private readonly webhookSignatureHeaders = [
    'stripe-signature',
    'x-hub-signature-256',
    'x-shopify-hmac-sha256',
    'x-header-signature',
    'svix-signature',
  ];

  /**
   * Detects if request contains webhook signature headers
   */
  private hasWebhookSignature(req: Request): boolean {
    return this.webhookSignatureHeaders.some((header) => {
      // Express normalizes headers to lowercase
      const headerValue = req.headers[header.toLowerCase()];
      return headerValue !== undefined && headerValue !== '';
    });
  }

  use(req: RequestWithRawBody, res: Response, next: NextFunction): void {
    this.logger.debug(
      `Middleware processing: ${req.method} ${req.url}, headers: ${JSON.stringify(Object.keys(req.headers))}`,
    );

    const hasSignature = this.hasWebhookSignature(req);

    if (hasSignature) {
      this.logger.debug(
        `Webhook signature detected for ${req.url}, rawBody available: ${!!req.rawBody}`,
      );
    } else {
      this.logger.debug(`No webhook signature for ${req.url}`);
    }

    // NestJS with rawBody: true already captures raw body bytes
    // We just need to pass through to the next middleware
    next();
  }
}
