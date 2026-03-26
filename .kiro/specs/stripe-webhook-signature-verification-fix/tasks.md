# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Webhook Signature Headers Trigger Raw Body Passthrough
  - **CRITICAL**: This test MUST FAIL on unfixed proxy configuration - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the proxy when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the proxy modifies webhook body bytes
  - **Scoped PBT Approach**: Test all 5 webhook providers (Stripe, GitHub, Shopify, Przelewy24, Clerk) with valid signatures
  - Test that for POST requests to `/hooks/*` with signature headers (`stripe-signature`, `x-hub-signature-256`, `x-shopify-hmac-sha256`, `x-header-signature`, `svix-signature`), the hookscope proxy forwards raw body bytes unmodified
  - Generate webhook requests with valid HMAC signatures for each provider
  - Send requests through hookscope proxy to origin server
  - Assert that signature verification succeeds (body bytes match what provider signed)
  - Run test on UNFIXED proxy configuration
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the proxy modifies body bytes)
  - Document counterexamples found: which providers fail, what transformations are applied (gzip decompression, encoding changes, whitespace normalization)
  - Mark task complete when test is written, run, and failures are documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Webhook Request Processing
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED proxy for non-webhook requests (requests without signature headers)
  - Send POST requests to `/api/users` without signature headers through proxy
  - Send GET requests to various endpoints through proxy
  - Send POST requests to `/hooks/*` WITHOUT signature headers through proxy
  - Send requests with different Content-Type headers (application/xml, text/plain) through proxy
  - Observe and record: proxy applies normal transformations, routing, caching for non-webhook traffic
  - Write property-based tests capturing observed behavior patterns: for all requests without signature headers, proxy applies normal processing
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED proxy configuration
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed proxy
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Fix for webhook signature verification failures
  - [x] 3.1 Configure hookscope proxy to detect signature headers and preserve raw body bytes
    - Add signature header detection logic to hookscope proxy configuration
    - Detect POST requests to `/hooks/*` with any of these headers: `stripe-signature`, `x-hub-signature-256`, `x-shopify-hmac-sha256`, `x-header-signature`, `svix-signature`
    - Disable gzip decompression when signature header is detected
    - Disable all body transformations when signature header is detected (character encoding normalization, whitespace normalization, line ending conversions, JSON parsing/re-serialization)
    - Preserve Content-Length header value exactly as received from webhook provider
    - Ensure configuration is extensible for future webhook providers
    - _Bug_Condition: isBugCondition(request) where request.method == 'POST' AND request.path MATCHES '/hooks/\*' AND signature header EXISTS AND hookscope_proxy_modifies_body(request)_
    - _Expected_Behavior: For all requests where isBugCondition(request), hookscope proxy forwards raw body bytes unmodified, preserving exact byte sequence that webhook provider signed_
    - _Preservation: Non-webhook requests (without signature headers) continue to pass through proxy with normal transformations_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Webhook Signature Headers Trigger Raw Body Passthrough
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms proxy now preserves raw body bytes for webhook requests)
    - Verify all 5 webhook providers (Stripe, GitHub, Shopify, Przelewy24, Clerk) now pass signature verification
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Webhook Request Processing
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions for non-webhook traffic)
    - Confirm all tests still pass after proxy configuration change (no regressions)
    - Verify non-webhook requests continue to receive normal proxy transformations

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
