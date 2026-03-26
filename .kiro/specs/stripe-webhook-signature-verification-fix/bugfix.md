# Bugfix Requirements Document

## Introduction

Webhook signature verification fails for ALL webhook providers that use HMAC-based signature verification when requests are proxied through hookscope (https://api.hookscope.dev). The hookscope proxy, which sits in front of Fastly CDN, modifies the raw request body bytes during transit, causing HMAC signature verification to fail with "webhook had no valid signature" errors.

This affects multiple webhook providers in the codebase:

- Stripe (Stripe-Signature header, HMAC-SHA256)
- GitHub (x-hub-signature-256 header, HMAC-SHA256)
- Shopify (x-shopify-hmac-sha256 header, HMAC-SHA256)
- Przelewy24 (x-header-signature header, SHA384)
- Clerk (svix-signature header for auth webhooks, HMAC-based)

All these providers sign webhook payloads using HMAC over the exact raw bytes of the request body. Any modification to these bytes—including gzip decompression, character encoding changes, whitespace normalization, or line ending conversions—invalidates the signature. The hookscope proxy must pass ALL webhook requests with signature headers through completely unmodified to preserve signature validity.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN any webhook provider (Stripe, GitHub, Shopify, Przelewy24, Clerk) sends a webhook request with a signature header (Stripe-Signature, x-hub-signature-256, x-shopify-hmac-sha256, x-header-signature, svix-signature) THEN the hookscope proxy decompresses gzip-encoded bodies before forwarding to the origin

1.2 WHEN any webhook provider sends a webhook request with specific Content-Encoding THEN the hookscope proxy re-encodes or transforms the body, altering the raw bytes

1.3 WHEN the origin server receives the proxied webhook request THEN signature verification fails because the received body bytes do not match the bytes the provider originally signed

1.4 WHEN signature verification fails THEN the webhook handler throws an authentication exception and returns an error response to the webhook provider

1.5 WHEN GitHub sends a webhook with x-hub-signature-256 header THEN the hookscope proxy modifies the body bytes, causing HMAC-SHA256 verification to fail

1.6 WHEN Shopify sends a webhook with x-shopify-hmac-sha256 header THEN the hookscope proxy modifies the body bytes, causing HMAC-SHA256 verification to fail

1.7 WHEN Clerk sends an auth webhook with svix-signature header THEN the hookscope proxy modifies the body bytes, causing signature verification to fail

### Expected Behavior (Correct)

2.1 WHEN any webhook provider sends a webhook request with a signature header (Stripe-Signature, x-hub-signature-256, x-shopify-hmac-sha256, x-header-signature, svix-signature) THEN the hookscope proxy SHALL forward the raw request body bytes completely unmodified

2.2 WHEN any webhook provider sends a webhook with Content-Encoding: gzip THEN the hookscope proxy SHALL preserve the gzip encoding and forward it as-is to the origin without decompression

2.3 WHEN the hookscope proxy forwards a webhook request with any signature header THEN it SHALL preserve the exact Content-Length header value received from the provider

2.4 WHEN the origin server receives the proxied webhook request THEN signature verification SHALL succeed because the body bytes match exactly what the provider signed

2.5 WHEN a POST request contains ANY webhook signature header (Stripe-Signature, x-hub-signature-256, x-shopify-hmac-sha256, x-header-signature, svix-signature) THEN the hookscope proxy SHALL disable all body transformation, buffering, caching, and content manipulation for that request

2.6 WHEN GitHub sends a webhook with x-hub-signature-256 header THEN the hookscope proxy SHALL preserve raw body bytes and signature verification SHALL succeed

2.7 WHEN Shopify sends a webhook with x-shopify-hmac-sha256 header THEN the hookscope proxy SHALL preserve raw body bytes and signature verification SHALL succeed

2.8 WHEN Clerk sends an auth webhook with svix-signature header THEN the hookscope proxy SHALL preserve raw body bytes and signature verification SHALL succeed

2.9 WHEN future webhook providers are added with new signature headers THEN the hookscope proxy SHALL support them by detecting signature headers and preserving raw body bytes

### Unchanged Behavior (Regression Prevention)

3.1 WHEN non-webhook requests (without any signature headers) pass through the hookscope proxy THEN the proxy SHALL CONTINUE TO apply normal request processing and transformations

3.2 WHEN the origin server's webhook handler receives a valid signature for any provider THEN it SHALL CONTINUE TO successfully verify and process the webhook event

3.3 WHEN the NestJS application processes webhook requests THEN it SHALL CONTINUE TO use req.rawBody for signature verification as currently implemented

3.4 WHEN Stripe webhook verification succeeds THEN the billing handler SHALL CONTINUE TO process subscription events correctly

3.5 WHEN GitHub webhook verification succeeds THEN the webhook handler SHALL CONTINUE TO process repository events correctly

3.6 WHEN Shopify webhook verification succeeds THEN the webhook handler SHALL CONTINUE TO process e-commerce events correctly

3.7 WHEN the WebhookGuard validates signatures THEN it SHALL CONTINUE TO use the WebhookVerificationService with provider-specific verification logic
