/** Minimal Stripe-like types to avoid requiring the stripe package at compile time. */
export interface StripeCheckoutSession {
  object: 'checkout.session';
  mode?: string;
  [key: string]: unknown;
}
export interface StripeSubscription {
  object: 'subscription';
  status?: string;
  customer?: string;
  [key: string]: unknown;
}
export interface StripeInvoice {
  object: 'invoice';
  customer?: string;
  subscription?: unknown;
  subscription_id?: unknown;
  parent?: unknown;
  subscription_details?: unknown;
  lines?: { data?: Array<Record<string, unknown>> };
  [key: string]: unknown;
}
export interface StripePaymentIntent {
  object: 'payment_intent';
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}

/**
 * Type guard to check if the event data object is a Checkout Session.
 */
export function isCheckoutSession(
  obj: unknown,
): obj is StripeCheckoutSession {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;
  return (
    'object' in record &&
    record['object'] === 'checkout.session' &&
    'mode' in record
  );
}

/**
 * Type guard to check if the event data object is a Stripe Subscription.
 */
export function isStripeSubscription(obj: unknown): obj is StripeSubscription {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;
  return (
    'object' in record &&
    record['object'] === 'subscription' &&
    'status' in record &&
    'customer' in record
  );
}

/**
 * Type guard to check if the event data object is a Stripe Invoice.
 */
export function isStripeInvoice(obj: unknown): obj is StripeInvoice {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;
  return (
    'object' in record && record['object'] === 'invoice' && 'customer' in record
  );
}

/**
 * Type guard to check if the event data object is a Stripe PaymentIntent.
 */
export function isStripePaymentIntent(
  obj: unknown,
): obj is StripePaymentIntent {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const record = obj as Record<string, unknown>;
  return (
    'object' in record &&
    record['object'] === 'payment_intent' &&
    'amount' in record &&
    'currency' in record
  );
}

/**
 * Type guard to check if a value is a string.
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a Stripe Invoice has a payment_intent property.
 * Stripe Invoice can have payment_intent as string, PaymentIntent object, or null.
 * Note: payment_intent is an expandable field, so we access it via bracket notation.
 */
export function getInvoicePaymentIntentId(
  invoice: StripeInvoice,
): string | undefined {
  const record = invoice as unknown as Record<string, unknown>;
  const paymentIntent = record['payment_intent'];

  if (typeof paymentIntent === 'string') {
    return paymentIntent;
  }

  if (
    typeof paymentIntent === 'object' &&
    paymentIntent !== null &&
    'id' in paymentIntent
  ) {
    const obj = paymentIntent as Record<string, unknown>;
    if (typeof obj['id'] === 'string') {
      return obj['id'];
    }
  }

  return undefined;
}

function extractSubscriptionId(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as Record<string, unknown>)['id'] === 'string'
  ) {
    return (value as Record<string, unknown>)['id'] as string;
  }
  return undefined;
}

/**
 * Extracts the subscription ID from a Stripe Invoice (for subscription invoices).
 * Handles multiple API shapes: top-level subscription, parent.subscription_details (new API),
 * and line item parent.subscription_item_details.
 */
export function getInvoiceSubscriptionId(
  invoice: StripeInvoice,
): string | undefined {
  const record = invoice as unknown as Record<string, unknown>;

  const fromTop =
    extractSubscriptionId(record['subscription']) ??
    extractSubscriptionId(record['subscription_id']);
  if (fromTop) return fromTop;

  const parent = record['parent'] as Record<string, unknown> | null | undefined;
  if (parent) {
    const subDetails = parent['subscription_details'] as
      | Record<string, unknown>
      | null
      | undefined;
    const fromParent =
      subDetails &&
      (extractSubscriptionId(subDetails['subscription']) ??
        extractSubscriptionId(subDetails['subscription_id']));
    if (fromParent) return fromParent;
  }

  const subscriptionDetails = record['subscription_details'] as
    | Record<string, unknown>
    | null
    | undefined;
  if (subscriptionDetails) {
    const subId =
      extractSubscriptionId(subscriptionDetails['subscription']) ??
      extractSubscriptionId(subscriptionDetails['subscription_id']);
    if (subId) return subId;
  }

  const lines = record['lines'] as
    | { data?: Array<Record<string, unknown>> }
    | undefined;
  const items = lines?.data ?? [];
  for (const item of items) {
    let subId =
      extractSubscriptionId(item['subscription']) ??
      extractSubscriptionId(item['subscription_id']);
    if (!subId && item['parent']) {
      const itemParent = item['parent'] as Record<string, unknown>;
      const subItemDetails = itemParent['subscription_item_details'] as
        | Record<string, unknown>
        | null
        | undefined;
      subId =
        subItemDetails &&
        (extractSubscriptionId(subItemDetails['subscription']) ??
          extractSubscriptionId(subItemDetails['subscription_id']));
    }
    if (subId) return subId;
  }

  return undefined;
}
