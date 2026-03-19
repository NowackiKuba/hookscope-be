export type WebhookAlertStatusValue = 'unread' | 'read' | 'dismissed';

const VALID_STATUSES = ['unread', 'read', 'dismissed'];

export class WebhookAlertStatus {
  private _value: WebhookAlertStatusValue;

  private constructor(v: string) {
    if (!VALID_STATUSES.includes(v)) {
      // TODO
    }

    this._value = v as WebhookAlertStatusValue;
  }

  static create(v: string) {
    return new WebhookAlertStatus(v);
  }

  get value(): WebhookAlertStatusValue {
    return this._value;
  }

  static unread(): WebhookAlertStatus {
    return new WebhookAlertStatus('unread');
  }
  static read(): WebhookAlertStatus {
    return new WebhookAlertStatus('read');
  }
  static dismissed(): WebhookAlertStatus {
    return new WebhookAlertStatus('dismissed');
  }
}
