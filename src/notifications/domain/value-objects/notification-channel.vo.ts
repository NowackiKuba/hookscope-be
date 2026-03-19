export type NotificationChannelValue = 'inApp' | 'email' | 'slack';

const VALID_CHANNElS = ['inApp', 'email', 'slack'];

export class NotificationChannel {
  private _value: NotificationChannelValue;

  private constructor(v: string) {
    if (!VALID_CHANNElS.includes(v)) {
      throw new Error(`Unsupported notification channel: ${v}`);
    }

    this._value = v as NotificationChannelValue;
  }

  static create(v: string) {
    return new NotificationChannel(v);
  }

  get value(): NotificationChannelValue {
    return this._value;
  }

  static inApp(): NotificationChannel {
    return new NotificationChannel('inApp');
  }
  static email(): NotificationChannel {
    return new NotificationChannel('email');
  }
  static slack(): NotificationChannel {
    return new NotificationChannel('slack');
  }
}
