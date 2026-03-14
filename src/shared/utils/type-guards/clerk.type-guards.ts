import type { ClerkWebhookEventType } from '../../../auth/domain/enums/clerk-webhook-event-type.enum';

/**
 * Type representing a Clerk User response.
 */
export interface ClerkUser {
  id: string;
  emailAddresses?: Array<{ emailAddress: string }>;
  organizationMemberships?: Array<{ role: string }>;
}

/**
 * Type representing a Clerk webhook event.
 */
export interface ClerkWebhookEvent {
  type: ClerkWebhookEventType;
  data: {
    id: string;
    email_addresses?: Array<{
      email_address: string;
      verification?: { status: string };
    }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    created_at: number;
    updated_at: number;
  };
}

/**
 * Type representing a Clerk error response.
 */
export interface ClerkErrorResponse {
  status?: number;
  statusCode?: number;
  message?: string;
}

/**
 * Type guard to check if a value is a valid Clerk User.
 */
export function isClerkUser(value: unknown): value is ClerkUser {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return typeof obj['id'] === 'string';
}

/**
 * Type guard to check if an error is a Clerk error response.
 */
export function isClerkError(error: unknown): error is ClerkErrorResponse {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const obj = error as Record<string, unknown>;
  return (
    typeof obj['status'] === 'number' ||
    typeof obj['statusCode'] === 'number' ||
    typeof obj['message'] === 'string'
  );
}

/**
 * Type guard to check if a value is a valid Clerk webhook event.
 */
export function isClerkWebhookEvent(
  value: unknown,
): value is ClerkWebhookEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj['type'] !== 'string') {
    return false;
  }

  const data = obj['data'];
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const dataObj = data as Record<string, unknown>;
  return typeof dataObj['id'] === 'string';
}
