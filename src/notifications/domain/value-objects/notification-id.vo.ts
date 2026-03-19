export class NotificationId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): NotificationId {
    if (!value || value.trim().length === 0) {
      throw new Error('NotificationId cannot be empty');
    }

    return new NotificationId(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: NotificationId): boolean {
    return this._value === other._value;
  }
}
