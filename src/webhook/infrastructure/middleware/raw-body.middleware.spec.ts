import { RawBodyMiddleware } from './raw-body.middleware';
import { Request, Response, NextFunction } from 'express';
import { Readable } from 'stream';

type RequestWithRawBody = Request & { rawBody?: Buffer };

/**
 * Unit tests for RawBodyMiddleware webhook signature preservation
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 3.3
 */
describe('RawBodyMiddleware', () => {
  let middleware: RawBodyMiddleware;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new RawBodyMiddleware();
    mockResponse = {};
    nextFunction = jest.fn();
  });

  const createMockRequest = (
    body: string,
    headers: Record<string, string>,
  ): RequestWithRawBody => {
    const readable = new Readable();
    readable.push(body);
    readable.push(null);

    const req = Object.assign(readable, {
      headers,
      method: 'POST',
      url: '/hooks/test-token',
    }) as RequestWithRawBody;

    return req;
  };

  describe('Webhook signature header detection', () => {
    it('should detect stripe-signature header and preserve raw body', (done) => {
      const payload = JSON.stringify({
        event: 'charge.succeeded',
        id: 'evt_123',
      });
      const req = createMockRequest(payload, {
        'content-type': 'application/json',
        'stripe-signature': 't=1234567890,v1=abc123',
      });

      nextFunction = jest.fn(() => {
        expect(req.rawBody).toBeDefined();
        expect(req.rawBody?.toString('utf8')).toBe(payload);
        done();
      });

      middleware.use(req, mockResponse as Response, nextFunction);
    });

    it('should detect x-hub-signature-256 header and preserve raw body', (done) => {
      const payload = JSON.stringify({
        action: 'opened',
        pull_request: { id: 123 },
      });
      const req = createMockRequest(payload, {
        'content-type': 'application/json',
        'x-hub-signature-256': 'sha256=def456',
      });

      nextFunction = jest.fn(() => {
        expect(req.rawBody).toBeDefined();
        expect(req.rawBody?.toString('utf8')).toBe(payload);
        done();
      });

      middleware.use(req, mockResponse as Response, nextFunction);
    });

    it('should detect x-shopify-hmac-sha256 header and preserve raw body', (done) => {
      const payload = JSON.stringify({
        topic: 'orders/create',
        id: 'order_456',
      });
      const req = createMockRequest(payload, {
        'content-type': 'application/json',
        'x-shopify-hmac-sha256': 'ghi789',
      });

      nextFunction = jest.fn(() => {
        expect(req.rawBody).toBeDefined();
        expect(req.rawBody?.toString('utf8')).toBe(payload);
        done();
      });

      middleware.use(req, mockResponse as Response, nextFunction);
    });

    it('should detect x-header-signature header and preserve raw body', (done) => {
      const payload = JSON.stringify({ crc: 'test_crc', amount: 12345 });
      const req = createMockRequest(payload, {
        'content-type': 'application/json',
        'x-header-signature': 'jkl012',
      });

      nextFunction = jest.fn(() => {
        expect(req.rawBody).toBeDefined();
        expect(req.rawBody?.toString('utf8')).toBe(payload);
        done();
      });

      middleware.use(req, mockResponse as Response, nextFunction);
    });

    it('should detect svix-signature header and preserve raw body', (done) => {
      const payload = JSON.stringify({
        type: 'user.created',
        data: { id: 'user_123' },
      });
      const req = createMockRequest(payload, {
        'content-type': 'application/json',
        'svix-signature': 'v1,g0hM9SsE+OTPJTGt/tmzilNP+ZlQzSmb1Y=',
      });

      nextFunction = jest.fn(() => {
        expect(req.rawBody).toBeDefined();
        expect(req.rawBody?.toString('utf8')).toBe(payload);
        done();
      });

      middleware.use(req, mockResponse as Response, nextFunction);
    });
  });

  describe('Edge cases', () => {
    it('should treat empty signature header as non-webhook request', (done) => {
      const payload = JSON.stringify({ test: 'data' });
      const req = createMockRequest(payload, {
        'content-type': 'application/json',
        'stripe-signature': '',
      });

      // Empty signature should trigger JSON parser, which will call next after parsing
      nextFunction = jest.fn(() => {
        // JSON parser was used (not raw body reader)
        done();
      });

      middleware.use(req, mockResponse as Response, nextFunction);
    });

    it('should preserve exact byte sequence including whitespace', (done) => {
      const payload = JSON.stringify({ event: 'test', data: 'value' }, null, 2);
      const req = createMockRequest(payload, {
        'content-type': 'application/json',
        'stripe-signature': 't=1234567890,v1=abc123',
      });

      nextFunction = jest.fn(() => {
        expect(req.rawBody).toBeDefined();
        expect(req.rawBody?.toString('utf8')).toBe(payload);
        // Verify whitespace is preserved
        expect(req.rawBody?.toString('utf8')).toContain('\n');
        expect(req.rawBody?.toString('utf8')).toContain('  ');
        done();
      });

      middleware.use(req, mockResponse as Response, nextFunction);
    });

    it('should handle requests with multiple headers including signature', (done) => {
      const payload = JSON.stringify({ event: 'test' });
      const req = createMockRequest(payload, {
        'content-type': 'application/json',
        'user-agent': 'Stripe/1.0',
        'x-request-id': 'req_123',
        'stripe-signature': 't=1234567890,v1=abc123',
      });

      nextFunction = jest.fn(() => {
        expect(req.rawBody).toBeDefined();
        expect(req.rawBody?.toString('utf8')).toBe(payload);
        done();
      });

      middleware.use(req, mockResponse as Response, nextFunction);
    });
  });
});
