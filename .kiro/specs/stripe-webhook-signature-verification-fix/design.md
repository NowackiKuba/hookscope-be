# Webhook Signature Verification Fix Design

## Overview

This bugfix addresses webhook signature verification failures caused by the hookscope proxy (https://api.hookscope.dev) modifying raw request body bytes during transit. The proxy sits in front of Fastly CDN and currently applies body transformations (gzip decompression, encoding changes, whitespace normalization) that invalidate HMAC-based signatures for all webhook providers.

The fix is primarily an infrastructure/proxy configuration change, not application code modification. The solution involves configuring the hookscope proxy to detect webhook signature headers and disable all body transformations for those requests, ensuring raw bytes are passed through unmodified to the origin server.

The NestJS application already correctly uses `req.rawBody` for verification, so no application code changes are required—only proxy configuration to preserve the raw bytes that the application expects.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when webhook requests with signature headers pass through the hookscope proxy and have their body bytes modified
- **Property (P)**: The desired behavior when webhook requests are proxied - raw body bytes must be preserved exactly as sent by the provider
- **Preservation**: Existing non-webhook request handling and application-level verification logic that must remain unchanged
- **hookscope proxy**: The proxy service at https://api.hookscope.dev that sits in front of Fastly CDN and routes webhook requests to the origin server
- **HMAC signature**: Hash-based Message Authentication Code computed over the exact raw bytes of the request body, used by webhook providers to prove authenticity
- **rawBody**: The Buffer property attached to Express requests by NestJS middleware that contains the unmodified request body bytes for signature verification
- **Signature headers**: HTTP headers containing HMAC signatures: `stripe-signature`, `x-hub-signature-256`, `x-shopify-hmac-sha256`, `x-header-signature`, `svix-signature`

## Bug Details

### Bug Condition

The bug manifests when any webhook provider (Stripe, GitHub, Shopify, Przelewy24, Clerk) sends a webhook request with a signature header through the hookscope proxy. The proxy applies body transformations (gzip decompression, character encoding changes, whitespace normalization) that alter the raw bytes, causing the HMAC signature computed by the provider to no longer match the signature computed by the origin server over the modified bytes.

**Formal Specification:**

```
FUNCTION isBugCondition(request)
  INPUT: request of type HTTPRequest
  OUTPUT: boolean

  RETURN request.method == 'POST'
         AND request.path MATCHES '/hooks/*'
         AND (
           request.headers['stripe-signature'] EXISTS
           OR request.headers['x-hub-signature-256'] EXISTS
           OR request.headers['x-shopify-hmac-sha256'] EXISTS
           OR request.headers['x-header-signature'] EXISTS
           OR request.headers['svix-signature'] EXISTS
         )
         AND hookscope_proxy_modifies_body(request)
END FUNCTION
```

### Examples

- **Stripe webhook**: Provider sends POST to `/hooks/{token}` with `Content-Encoding: gzip`, `Stripe-Signature: t=1234567890,v1=abc123...`, and gzip-compressed JSON body. Hookscope proxy decompresses the body, changing the raw bytes. Origin server receives uncompressed body and computes HMAC over different bytes than Stripe signed, causing verification to fail with "webhook had no valid signature".

- **GitHub webhook**: Provider sends POST with `x-hub-signature-256: sha256=def456...` and JSON body with specific whitespace. Hookscope proxy normalizes whitespace or re-encodes the body. Origin server computes HMAC over modified bytes, signature verification fails.

- **Shopify webhook**: Provider sends POST with `x-shopify-hmac-sha256: ghi789...` and JSON body. Hookscope proxy applies character encoding transformation. Origin server receives body with different byte representation, HMAC verification fails.

- **Edge case - Non-webhook POST**: Regular POST request to `/api/users` without any signature headers passes through hookscope proxy with normal transformations applied (expected behavior, should remain unchanged).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- Non-webhook requests (without signature headers) must continue to pass through the hookscope proxy with normal request processing and transformations
- The NestJS application's `RawBodyMiddleware` must continue to capture raw body bytes using the `json()` verify callback
- The `WebhookGuard` must continue to use `WebhookVerificationService` with provider-specific verification logic
- All webhook provider implementations (Stripe, GitHub, Shopify, Przelewy24) must continue to use their current HMAC verification algorithms
- Webhook event processing after successful verification must continue to work exactly as before

**Scope:**
All requests that do NOT contain webhook signature headers should be completely unaffected by this fix. This includes:

- Regular API requests to `/api/*` endpoints
- Non-webhook POST requests
- GET, PUT, DELETE, PATCH requests
- Requests with other authentication mechanisms (JWT, API keys)

## Hypothesized Root Cause

Based on the bug description and analysis of the codebase, the most likely issues are:

1. **Proxy Gzip Decompression**: The hookscope proxy automatically decompresses gzip-encoded request bodies before forwarding to the origin, changing the raw bytes that were signed by the webhook provider

2. **Content-Encoding Transformation**: The proxy may be re-encoding bodies with different character encodings (UTF-8 normalization, line ending conversions) that alter byte-level representation

3. **Body Buffering/Caching**: The proxy may be buffering or caching request bodies in a way that modifies the byte stream during transit

4. **Missing Passthrough Configuration**: The hookscope proxy lacks configuration to detect webhook signature headers and bypass all body transformation logic for those requests

The application code is correctly implemented—`RawBodyMiddleware` captures the raw bytes, and all webhook providers correctly compute HMAC signatures. The issue is purely at the infrastructure layer where the proxy modifies bytes before they reach the application.

## Correctness Properties

Property 1: Bug Condition - Webhook Signature Headers Trigger Raw Body Passthrough

_For any_ HTTP POST request to `/hooks/*` that contains a webhook signature header (`stripe-signature`, `x-hub-signature-256`, `x-shopify-hmac-sha256`, `x-header-signature`, or `svix-signature`), the hookscope proxy SHALL forward the raw request body bytes completely unmodified, preserving the exact byte sequence that the webhook provider signed, allowing the origin server's HMAC verification to succeed.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8**

Property 2: Preservation - Non-Webhook Request Processing

_For any_ HTTP request that does NOT contain a webhook signature header (non-webhook requests, regular API calls, requests to other endpoints), the hookscope proxy SHALL continue to apply normal request processing, transformations, and routing logic exactly as it does currently, preserving all existing behavior for non-webhook traffic.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct, the fix requires configuring the hookscope proxy to detect webhook signature headers and disable body transformations:

**Infrastructure**: hookscope proxy configuration (Fastly VCL, proxy middleware, or routing rules)

**Specific Changes**:

1. **Add Signature Header Detection**: Configure the proxy to inspect incoming POST requests to `/hooks/*` for the presence of any webhook signature header:
   - `stripe-signature`
   - `x-hub-signature-256`
   - `x-shopify-hmac-sha256`
   - `x-header-signature`
   - `svix-signature`

2. **Disable Gzip Decompression**: When a signature header is detected, configure the proxy to preserve `Content-Encoding: gzip` and forward the compressed body as-is without decompression

3. **Disable Body Transformations**: When a signature header is detected, disable all body transformation logic including:
   - Character encoding normalization
   - Whitespace normalization
   - Line ending conversions
   - JSON parsing/re-serialization
   - Body buffering that might alter byte order

4. **Preserve Content-Length**: Ensure the proxy forwards the exact `Content-Length` header value received from the webhook provider without recalculation

5. **Add Extensibility**: Design the configuration to easily support future webhook providers by adding new signature header patterns to the detection list

**Alternative Implementation (if proxy configuration is not accessible)**:

If the hookscope proxy configuration cannot be modified directly, an alternative approach would be to:

- Deploy a lightweight reverse proxy (nginx, Envoy) in front of the origin server
- Configure this proxy to detect signature headers and pass through raw bytes
- Route webhook traffic through this proxy before reaching the NestJS application

However, this adds unnecessary infrastructure complexity when the root cause is at the hookscope proxy layer.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on the current proxy configuration, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the proxy configuration fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Send webhook requests with signature headers through the hookscope proxy to the origin server and observe signature verification failures. Capture the raw bytes received by the origin server and compare them to the bytes sent by the webhook provider to identify the specific transformations being applied.

**Test Cases**:

1. **Stripe Gzip Test**: Send a Stripe webhook with `Content-Encoding: gzip` and valid `Stripe-Signature` header through the proxy (will fail on unfixed proxy - expect decompression)
2. **GitHub Raw Body Test**: Send a GitHub webhook with `x-hub-signature-256` header and specific whitespace patterns through the proxy (will fail on unfixed proxy - expect whitespace normalization)
3. **Shopify Encoding Test**: Send a Shopify webhook with `x-shopify-hmac-sha256` header and Unicode characters through the proxy (will fail on unfixed proxy - expect encoding changes)
4. **Przelewy24 Test**: Send a Przelewy24 webhook with `x-header-signature` header through the proxy (will fail on unfixed proxy)
5. **Clerk Svix Test**: Send a Clerk webhook with `svix-signature` header through the proxy (will fail on unfixed proxy)

**Expected Counterexamples**:

- Origin server receives body bytes that differ from the bytes sent by the webhook provider
- Possible causes: gzip decompression, character encoding changes, whitespace normalization, JSON re-serialization

### Fix Checking

**Goal**: Verify that for all webhook requests where the bug condition holds (signature header present), the fixed proxy configuration preserves raw body bytes and signature verification succeeds.

**Pseudocode:**

```
FOR ALL request WHERE isBugCondition(request) DO
  original_bytes := webhook_provider_sends(request)
  proxied_bytes := origin_server_receives(request)
  ASSERT original_bytes == proxied_bytes
  ASSERT signature_verification_succeeds(request)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all requests where the bug condition does NOT hold (no signature header), the fixed proxy configuration continues to apply normal transformations exactly as before.

**Pseudocode:**

```
FOR ALL request WHERE NOT isBugCondition(request) DO
  ASSERT proxy_behavior_before_fix(request) == proxy_behavior_after_fix(request)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:

- It generates many test cases automatically across the request input domain
- It catches edge cases that manual tests might miss (different content types, encodings, paths)
- It provides strong guarantees that non-webhook traffic is completely unaffected

**Test Plan**: Observe proxy behavior on current configuration for non-webhook requests (API calls, different HTTP methods, different paths), then write property-based tests capturing that behavior and verify it remains unchanged after the fix.

**Test Cases**:

1. **API Request Preservation**: Send POST requests to `/api/users` without signature headers, verify proxy applies normal transformations before and after fix
2. **GET Request Preservation**: Send GET requests to various endpoints, verify proxy routing and caching behavior unchanged
3. **Non-Webhook POST Preservation**: Send POST requests to `/hooks/*` WITHOUT signature headers, verify they are processed normally (not treated as webhooks)
4. **Different Content-Type Preservation**: Send requests with `Content-Type: application/xml`, `text/plain`, etc., verify proxy handling unchanged

### Unit Tests

- Test signature header detection logic in proxy configuration (if testable)
- Test that each of the 5 signature headers triggers passthrough mode
- Test that requests without signature headers do not trigger passthrough mode
- Test Content-Length preservation for webhook requests
- Test gzip encoding preservation for webhook requests

### Property-Based Tests

- Generate random webhook requests with valid signatures across all 5 providers and verify all signatures verify successfully after proxying
- Generate random non-webhook requests and verify proxy behavior is identical before and after the fix
- Generate random HTTP headers and verify only the 5 specific signature headers trigger passthrough mode
- Test edge cases: multiple signature headers, case-insensitive header matching, signature headers with empty values

### Integration Tests

- Test full webhook flow for Stripe: send real Stripe webhook through proxy, verify signature verification succeeds and subscription event is processed
- Test full webhook flow for GitHub: send real GitHub webhook through proxy, verify signature verification succeeds
- Test full webhook flow for Shopify: send real Shopify webhook through proxy, verify signature verification succeeds
- Test that non-webhook API requests continue to work correctly after proxy configuration change
- Test switching between webhook and non-webhook requests to the same endpoint path
