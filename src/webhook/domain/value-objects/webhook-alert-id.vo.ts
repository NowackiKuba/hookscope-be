export class WebhookAlertId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): WebhookAlertId {
    if (!value || value.trim().length === 0) {
      throw new Error('WebhookAlertId cannot be empty');
    }
    // Clerk IDs are typically non-empty strings
    // We accept any non-empty string as a valid Clerk ID
    return new WebhookAlertId(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: WebhookAlertId): boolean {
    return this._value === other._value;
  }
}
