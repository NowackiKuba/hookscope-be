export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): Email {
    const normalized = Email.normalize(value);
    if (!normalized || !Email.isValid(normalized)) {
      throw new Error('Invalid email format');
    }
    return new Email(normalized);
  }

  private static normalize(value: unknown): string {
    if (value == null) return '';
    const s = String(value)
      .replace(/\uFEFF/g, '') // BOM
      .replace(/\0/g, '')
      .trim()
      .toLowerCase();
    return s;
  }

  /** Relaxed check: local@domain.tld, no spaces, at least one dot in domain. */
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

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
