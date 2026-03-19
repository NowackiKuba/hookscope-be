export type NotificationStatusValue = 'sent' | 'read' | 'archived' | 'failed';

const VALID_STATUSES = ['sent', 'read', 'archived', 'failed'];

export class NotificationStatus {
  private _value: NotificationStatusValue;

  private constructor(v: string) {
    if (!VALID_STATUSES.includes(v)) {
      throw new Error(`Unsupported notification status: ${v}`);
    }

    this._value = v as NotificationStatusValue;
  }

  static create(v: string) {
    return new NotificationStatus(v);
  }

  get value(): NotificationStatusValue {
    return this._value;
  }

  static sent(): NotificationStatus {
    return new NotificationStatus('sent');
  }
  static read(): NotificationStatus {
    return new NotificationStatus('read');
  }
  static archived(): NotificationStatus {
    return new NotificationStatus('archived');
  }
  static failed(): NotificationStatus {
    return new NotificationStatus('failed');
  }
}
