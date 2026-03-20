export type WebhookAlertScannerStatusValue = 'active' | 'resolved';

const VALID_SCANNER_STATUSES: WebhookAlertScannerStatusValue[] = [
  'active',
  'resolved',
];

export class WebhookAlertScannerStatus {
  private _value: WebhookAlertScannerStatusValue;

  private constructor(v: string) {
    if (!VALID_SCANNER_STATUSES.includes(v as WebhookAlertScannerStatusValue)) {
      throw new Error(`Invalid webhook alert scanner status: ${v}`);
    }

    this._value = v as WebhookAlertScannerStatusValue;
  }

  static create(v: string): WebhookAlertScannerStatus {
    return new WebhookAlertScannerStatus(v);
  }

  static active(): WebhookAlertScannerStatus {
    return new WebhookAlertScannerStatus('active');
  }

  static resolved(): WebhookAlertScannerStatus {
    return new WebhookAlertScannerStatus('resolved');
  }

  get value(): WebhookAlertScannerStatusValue {
    return this._value;
  }
}
