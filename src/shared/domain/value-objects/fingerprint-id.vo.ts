import { BaseId } from './base-id.vo';

/**
 * Value object representing a fingerprint identifier.
 * Used to identify anonymous users by their device fingerprint.
 */
export class FingerprintId extends BaseId {
  protected constructor(value: string) {
    super(value);
  }

  static create(value: string): FingerprintId {
    if (!value || value.trim().length === 0) {
      throw new Error('FingerprintId cannot be empty');
    }
    return new FingerprintId(value.trim());
  }

  static generate(): FingerprintId {
    return new FingerprintId(BaseId.generateUuid());
  }

  equals(other: FingerprintId): boolean {
    return this.value === other.value;
  }
}
