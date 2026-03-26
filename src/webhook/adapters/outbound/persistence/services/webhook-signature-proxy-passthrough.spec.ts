import { createHash, createHmac, randomBytes } from "crypto";
import { WebhookVerificationService } from "./webhook-verification.service";
import { GitHubWebhookProvider } from "../../external/github-webhook.provider";
import { Przelewy24WebhookProvider } from "../../external/przelewy24-webhook.provider";
import { ShopifyWebhookProvider } from "../../external/shopify-webhook.provider";
import { StripeWebhookProvider } from "../../external/stripe-webhook.provider";

/**
 * Bug Condition Exploration Test
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
 *
 * Property 1: Bug Condition - Webhook Signature Headers Trigger Raw Body Passthrough
 *
 * CRITICAL: This test demonstrates the bug by showing that body transformations
 * break signature verification. This is what the hookscope proxy currently does.
 *
 * GOAL: Surface counterexamples that demonstrate body byte modifications break HMAC verification
 *
 * This test simulates hookscope proxy behavior by applying transformations (whitespace
 * normalization, encoding changes). When applied, signature verification FAILS, proving the bug.
 *
 * EXPECTED OUTCOME: All tests pass, demonstrating body modifications break signatures.
 */
describe("Webhook Signature Proxy Passthrough - Bug Exploration", () => {
  const providers = [
    new StripeWebhookProvider(),
    new GitHubWebhookProvider(),
    new ShopifyWebhookProvider(),
    new Przelewy24WebhookProvider(),
  ];
  const service = new WebhookVerificationService(providers);

  function simulateProxyTransformations(originalBody: Buffer): Buffer {
    const bodyString = originalBody.toString("utf8");
    const normalized = bodyString.replace(/\s+/g, " ").trim();
    return Buffer.from(normalized, "utf8");
  }

  it("demonstrates Stripe signature fails when body bytes modified", () => {
    const payload = Buffer.from(
      JSON.stringify({ event: "charge.succeeded", id: "evt_123" }, null, 2),
    );
    const secret = "stripe_test_secret_" + randomBytes(16).toString("hex");
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signedPayload = `${timestamp}.${payload.toString("utf8")}`;
    const signature = createHmac("sha256", secret).update(signedPayload).digest("hex");

    const resultOriginal = service.verify(
      "stripe",
      payload,
      { "stripe-signature": `t=${timestamp},v1=${signature}` },
      secret,
    );
    expect(resultOriginal).toBe(true);

    const transformedPayload = simulateProxyTransformations(payload);
    expect(transformedPayload.equals(payload)).toBe(false);

    const resultTransformed = service.verify(
      "stripe",
      transformedPayload,
      { "stripe-signature": `t=${timestamp},v1=${signature}` },
      secret,
    );

    expect(resultTransformed).toBe(false);
  });

  it("demonstrates GitHub signature fails when body bytes modified", () => {
    const payload = Buffer.from(
      JSON.stringify({ action: "opened", pull_request: { id: 123 } }, null, 2),
    );
    const secret = "github_test_secret_" + randomBytes(16).toString("hex");
    const signature = createHmac("sha256", secret).update(payload).digest("hex");

    const resultOriginal = service.verify(
      "github",
      payload,
      { "x-hub-signature-256": `sha256=${signature}` },
      secret,
    );
    expect(resultOriginal).toBe(true);

    const transformedPayload = simulateProxyTransformations(payload);
    expect(transformedPayload.equals(payload)).toBe(false);

    const resultTransformed = service.verify(
      "github",
      transformedPayload,
      { "x-hub-signature-256": `sha256=${signature}` },
      secret,
    );

    expect(resultTransformed).toBe(false);
  });

  it("demonstrates Shopify signature fails when body bytes modified", () => {
    const payload = Buffer.from(
      JSON.stringify({ topic: "orders/create", id: "order_456" }, null, 2),
    );
    const secret = "shopify_test_secret_" + randomBytes(16).toString("hex");
    const signature = createHmac("sha256", secret).update(payload).digest("base64");

    const resultOriginal = service.verify(
      "shopify",
      payload,
      { "x-shopify-hmac-sha256": signature },
      secret,
    );
    expect(resultOriginal).toBe(true);

    const transformedPayload = simulateProxyTransformations(payload);
    expect(transformedPayload.equals(payload)).toBe(false);

    const resultTransformed = service.verify(
      "shopify",
      transformedPayload,
      { "x-shopify-hmac-sha256": signature },
      secret,
    );

    expect(resultTransformed).toBe(false);
  });

  it("demonstrates Przelewy24 signature fails when body bytes modified", () => {
    const payloadObject = {
      crc: "p24_crc_" + randomBytes(8).toString("hex"),
      amount: 12345,
      orderId: "ord_" + randomBytes(8).toString("hex"),
    };
    const payload = Buffer.from(JSON.stringify(payloadObject, null, 2));
    const secret = "przelewy24_test_secret_" + randomBytes(16).toString("hex");
    const signature = createHash("sha384")
      .update(`${payload.toString("utf8")}|${payloadObject.crc}|${secret}`)
      .digest("hex");

    const resultOriginal = service.verify(
      "przelewy24",
      payload,
      { "x-header-signature": signature },
      secret,
    );
    expect(resultOriginal).toBe(true);

    const transformedPayload = simulateProxyTransformations(payload);
    expect(transformedPayload.equals(payload)).toBe(false);

    const resultTransformed = service.verify(
      "przelewy24",
      transformedPayload,
      { "x-header-signature": signature },
      secret,
    );

    expect(resultTransformed).toBe(false);
  });

  it("documents counterexamples for all webhook providers", () => {
    const testCases = [
      {
        provider: "Stripe",
        payload: Buffer.from('{"event":"test",  "id":  "123"}'),
        header: "stripe-signature",
      },
      {
        provider: "GitHub",
        payload: Buffer.from('{"action":"opened",\n  "id":123}'),
        header: "x-hub-signature-256",
      },
      {
        provider: "Shopify",
        payload: Buffer.from('{"topic":"orders/create",  "data":"test"}'),
        header: "x-shopify-hmac-sha256",
      },
      {
        provider: "Przelewy24",
        payload: Buffer.from('{"crc":"test123",  "amount":  5000}'),
        header: "x-header-signature",
      },
    ];

    const results: Array<{
      provider: string;
      header: string;
      originalOk: boolean;
      transformedOk: boolean;
    }> = [];

    testCases.forEach(({ provider, payload, header }) => {
      const secret = "test_secret_" + randomBytes(8).toString("hex");
      let headers: Record<string, string>;

      if (provider === "Stripe") {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signedPayload = `${timestamp}.${payload.toString("utf8")}`;
        const sig = createHmac("sha256", secret).update(signedPayload).digest("hex");
        headers = { "stripe-signature": `t=${timestamp},v1=${sig}` };
      } else if (provider === "GitHub") {
        const sig = createHmac("sha256", secret).update(payload).digest("hex");
        headers = { "x-hub-signature-256": `sha256=${sig}` };
      } else if (provider === "Shopify") {
        const sig = createHmac("sha256", secret).update(payload).digest("base64");
        headers = { "x-shopify-hmac-sha256": sig };
      } else {
        const obj = JSON.parse(payload.toString("utf8")) as { crc: string };
        const sig = createHash("sha384")
          .update(`${payload.toString("utf8")}|${obj.crc}|${secret}`)
          .digest("hex");
        headers = { "x-header-signature": sig };
      }

      const originalOk = service.verify(provider.toLowerCase(), payload, headers, secret);
      const transformed = simulateProxyTransformations(payload);
      const transformedOk = service.verify(provider.toLowerCase(), transformed, headers, secret);

      results.push({ provider, header, originalOk, transformedOk });
    });

    console.log("\n=== Bug Condition Exploration Results ===");
    console.log("Testing webhook signature verification with body transformations\n");
    results.forEach(({ provider, header, originalOk, transformedOk }) => {
      console.log(`${provider} (${header}):`);
      console.log(`  Original payload verified: ${originalOk ? "✓" : "✗"}`);
      console.log(`  Transformed payload verified: ${transformedOk ? "✓" : "✗"}`);
      if (originalOk && !transformedOk) {
        console.log(`  ✗ BUG CONFIRMED: Body transformation breaks verification`);
      }
      console.log("");
    });
    console.log("CONCLUSION: All providers fail when proxy modifies body bytes");
    console.log("This confirms hookscope proxy must preserve raw body bytes for webhooks");
    console.log("==========================================\n");

    results.forEach(({ originalOk, transformedOk }) => {
      expect(originalOk).toBe(true);
      expect(transformedOk).toBe(false);
    });
  });
});
