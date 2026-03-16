export class WaitlistId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): WaitlistId {
    if (!value || value.trim().length === 0) {
      throw new Error('WaitlistId cannot be empty');
    }
    return new WaitlistId(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: WaitlistId): boolean {
    return this._value === other._value;
  }
}
