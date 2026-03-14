import { randomUUID } from 'crypto';

/**
 * Generates a random UUID string.
 * This utility provides a centralized way to generate UUIDs throughout the application.
 *
 * @returns A UUID v4 string
 *
 * @example
 * ```typescript
 * const id = generateUUID();
 * // Returns: "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function generateUUID(): string {
  return randomUUID();
}
