import { Injectable, NestMiddleware } from '@nestjs/common';
import { json, Request, Response, NextFunction } from 'express';

type RequestWithRawBody = Request & { rawBody?: Buffer };

/**
 * Middleware that preserves raw body bytes for webhook signature verification.
 *
 * For webhook requests with signature headers (stripe-signature, x-hub-signature-256,
 * x-shopify-hmac-sha256, x-header-signature, svix-signature), this middleware:
 * - Disables JSON parsing to prevent body transformations
 * - Preserves raw body bytes exactly as received from webhook provider
 * - Ensures HMAC signature verification succeeds
 *
 * For non-webhook requests (without signature headers):
 * - Applies normal JSON parsing and transformations
 */
@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  private readonly webhookSignatureHeaders = [
    'stripe-signature',
    'x-hub-signature-256',
    'x-shopify-hmac-sha256',
    'x-header-signature',
    'svix-signature',
  ];

  private readonly jsonParser = json({
    verify: (req: RequestWithRawBody, _res, buffer: Buffer) => {
      if (buffer?.length) {
        req.rawBody = Buffer.from(buffer);
      }
    },
  });

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

  /**
   * Manually reads raw body bytes without any transformations
   */
  private readRawBody(
    req: RequestWithRawBody,
    res: Response,
    next: NextFunction,
  ): void {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      req.rawBody = Buffer.concat(chunks);
      next();
    });

    req.on('error', (error) => {
      next(error);
    });
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // For webhook requests with signature headers: preserve raw body bytes
    if (this.hasWebhookSignature(req)) {
      this.readRawBody(req as RequestWithRawBody, res, next);
    } else {
      // For non-webhook requests: apply normal JSON parsing
      this.jsonParser(req, res, next);
    }
  }
}
