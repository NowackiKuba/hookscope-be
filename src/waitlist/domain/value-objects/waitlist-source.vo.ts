export class WaitlistSource {
  private readonly _value: string | null;

  private constructor(value: string | null) {
    this._value = value;
  }

  static create(value: string | null | undefined): WaitlistSource {
    if (value == null || value.trim() === '') {
      return new WaitlistSource(null);
    }
    return new WaitlistSource(value.trim());
  }

  get value(): string | null {
    return this._value;
  }

  equals(other: WaitlistSource): boolean {
    return this._value === other._value;
  }
}
