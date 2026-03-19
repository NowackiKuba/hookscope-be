import {
  decrypt,
  decryptSecret,
  encrypt,
  encryptSecret,
  stripSecretPrefix,
  validateEncryptionKey,
} from './encryption.util';

describe('encryption util', () => {
  const originalEncryptionKey = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);
  });

  afterEach(() => {
    if (originalEncryptionKey === undefined) {
      delete process.env.ENCRYPTION_KEY;
      return;
    }

    process.env.ENCRYPTION_KEY = originalEncryptionKey;
  });

  it('encrypt returns iv:authTag:encrypted format', () => {
    const encryptedValue = encrypt('test-plaintext');
    const segments = encryptedValue.split(':');

    expect(segments).toHaveLength(3);
    expect(segments[0]).toMatch(/^[0-9a-f]+$/);
    expect(segments[1]).toMatch(/^[0-9a-f]+$/);
    expect(segments[2]).toMatch(/^[0-9a-f]+$/);
    expect(segments[0]).toHaveLength(24);
    expect(segments[1]).toHaveLength(32);
  });

  it('decrypt(encrypt(plaintext)) returns original plaintext', () => {
    const plaintext = 'hello-world-secret';
    const encryptedValue = encrypt(plaintext);

    expect(decrypt(encryptedValue)).toBe(plaintext);
  });

  it('two encrypt calls on same plaintext return different results', () => {
    const plaintext = 'same-value';

    const encryptedOne = encrypt(plaintext);
    const encryptedTwo = encrypt(plaintext);

    expect(encryptedOne).not.toBe(encryptedTwo);
  });

  it('decrypt throws when auth tag is tampered', () => {
    const encryptedValue = encrypt('sensitive-data');
    const [ivHex, authTagHex, encryptedHex] = encryptedValue.split(':');

    const tamperedAuthTagHex = authTagHex.replace(/^./, (char) =>
      char === 'a' ? 'b' : 'a',
    );
    const tamperedCiphertext = `${ivHex}:${tamperedAuthTagHex}:${encryptedHex}`;

    expect(() => decrypt(tamperedCiphertext)).toThrow(
      'Decryption failed: invalid auth tag',
    );
  });

  it('encryptSecret and decryptSecret preserve whsec_ prefix', () => {
    const rawSecret = 'whsec_abc123secret';

    const encryptedSecret = encryptSecret(rawSecret);
    const decryptedSecret = decryptSecret(encryptedSecret);

    expect(decryptedSecret).toBe(rawSecret);
  });

  it('decryptSecret returns full string including prefix', () => {
    const rawSecret = 'whsec_prefix_is_preserved';

    const encryptedSecret = encryptSecret(rawSecret);

    expect(decryptSecret(encryptedSecret)).toBe(rawSecret);
  });

  it("stripSecretPrefix('whsec_abc', 'whsec_') returns 'abc'", () => {
    expect(stripSecretPrefix('whsec_abc', 'whsec_')).toBe('abc');
  });

  it("stripSecretPrefix('abc', 'whsec_') returns 'abc' unchanged", () => {
    expect(stripSecretPrefix('abc', 'whsec_')).toBe('abc');
  });

  it('validateEncryptionKey throws when key missing', () => {
    delete process.env.ENCRYPTION_KEY;

    expect(() => validateEncryptionKey()).toThrow('ENCRYPTION_KEY is missing');
  });

  it('validateEncryptionKey throws when key is wrong length', () => {
    process.env.ENCRYPTION_KEY = 'abc123';

    expect(() => validateEncryptionKey()).toThrow(
      'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)',
    );
  });
});
