export class WaitlistEmail {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): WaitlistEmail {
    const normalized = WaitlistEmail.normalize(value);
    if (!normalized || !WaitlistEmail.isValid(normalized)) {
      throw new Error('Invalid email format');
    }
    return new WaitlistEmail(normalized);
  }

  private static normalize(value: unknown): string {
    if (value == null) return '';
    return String(value)
      .replace(/\uFEFF/g, '')
      .replace(/\0/g, '')
      .trim()
      .toLowerCase();
  }

  private static isValid(email: string): boolean {
    if (!email || email.length > 254) return false;
    const atIndex = email.indexOf('@');
    if (atIndex <= 0 || atIndex === email.length - 1) return false;
    const domain = email.slice(atIndex + 1);
    const dotIndex = domain.indexOf('.');
    return dotIndex > 0 && dotIndex < domain.length - 1;
  }

  get value(): string {
    return this._value;
  }

  equals(other: WaitlistEmail): boolean {
    return this._value === other._value;
  }
}
