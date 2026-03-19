import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  type CipherGCMTypes,
} from 'crypto';

// Generate key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// Add to .env: ENCRYPTION_KEY=<generated_value>

const ALGORITHM: CipherGCMTypes = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;
const ENCRYPTION_KEY_HEX_LENGTH = 64;
const HEX_STRING_PATTERN = /^[0-9a-fA-F]+$/;

export type EncryptedValue = string;

function getEncryptionKeyBuffer(): Buffer {
  const encryptionKeyHex = process.env.ENCRYPTION_KEY;
  return Buffer.from(encryptionKeyHex ?? '', 'hex');
}

export function encrypt(plaintext: string): EncryptedValue {
  const iv = randomBytes(IV_LENGTH_BYTES);
  const key = getEncryptionKeyBuffer();
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encryptedChunks = [
    cipher.update(Buffer.from(plaintext, 'utf8')),
    cipher.final(),
  ];
  const encrypted = Buffer.concat(encryptedChunks);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(ciphertext: EncryptedValue): string {
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':');

  const iv = Buffer.from(ivHex ?? '', 'hex');
  const authTag = Buffer.from(authTagHex ?? '', 'hex');
  const encryptedData = Buffer.from(encryptedHex ?? '', 'hex');
  const key = getEncryptionKeyBuffer();
  const decipher = createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  try {
    const decryptedChunks = [decipher.update(encryptedData), decipher.final()];
    const decrypted = Buffer.concat(decryptedChunks);
    return decrypted.toString('utf8');
  } catch {
    throw new Error('Decryption failed: invalid auth tag');
  }
}

export function encryptSecret(rawSecret: string): EncryptedValue {
  return encrypt(rawSecret);
}

export function decryptSecret(ciphertext: EncryptedValue): string {
  return decrypt(ciphertext);
}

/**
 * Each provider is responsible for stripping its own prefix before HMAC:
 * - Clerk: stripSecretPrefix(secret, 'whsec_') then base64 decode
 * - Stripe: secret is used as-is (no prefix in standard webhook secrets)
 * - Future providers: strip their own prefixes here
 */
export function stripSecretPrefix(secret: string, prefix: string): string {
  if (!secret.startsWith(prefix)) {
    return secret;
  }

  return secret.slice(prefix.length);
}

export function validateEncryptionKey(): void {
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY is missing');
  }

  if (encryptionKey.length !== ENCRYPTION_KEY_HEX_LENGTH) {
    throw new Error(
      'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)',
    );
  }

  if (!HEX_STRING_PATTERN.test(encryptionKey)) {
    throw new Error('ENCRYPTION_KEY must contain only hexadecimal characters');
  }
}
