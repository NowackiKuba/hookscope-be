import { randomBytes } from 'crypto';

/** Default byte length for the token (32 bytes = 64 hex characters). */
const DEFAULT_TOKEN_BYTES = 32;

/**
 * Generates a cryptographically secure random token for password reset links.
 * Uses crypto.randomBytes and returns a hex string safe for URLs.
 *
 * @param byteLength - Number of random bytes (default 32). Longer = more secure, longer string.
 * @returns A hex-encoded random string (e.g. 64 chars for 32 bytes).
 */
export function generateResetPasswordToken(
  byteLength: number = DEFAULT_TOKEN_BYTES,
): string {
  return randomBytes(byteLength).toString('hex');
}
