export type WebhookAlertTypeValue =
  | 'schema_drift'
  | 'endpoint_error'
  | 'signature_failed'
  | 'duplicate_detected'
  | 'volume_spike'
  | 'silence_detected'
  | 'security_threat';

const VALID_TYPES = [
  'schema_drift',
  'endpoint_error',
  'signature_failed',
  'duplicate_detected',
  'volume_spike',
  'silence_detected',
  'security_threat',
];

export class WebhookAlertType {
  private _value: WebhookAlertTypeValue;

  private constructor(v: string) {
    if (!VALID_TYPES.includes(v)) {
      // TODO
    }

    this._value = v as WebhookAlertTypeValue;
  }

  static create(v: string) {
    return new WebhookAlertType(v);
  }

  get value(): WebhookAlertTypeValue {
    return this._value;
  }

  static schemaDrift(): WebhookAlertType {
    return new WebhookAlertType('schema_drift');
  }
  static endpointError(): WebhookAlertType {
    return new WebhookAlertType('endpoint_error');
  }
  static signatureFailed(): WebhookAlertType {
    return new WebhookAlertType('signature_failed');
  }
  static duplicateDetected(): WebhookAlertType {
    return new WebhookAlertType('duplicate_detected');
  }
  static volumeSpike(): WebhookAlertType {
    return new WebhookAlertType('volume_spike');
  }
  static silenceDetected(): WebhookAlertType {
    return new WebhookAlertType('silence_detected');
  }
  static securityThreat(): WebhookAlertType {
    return new WebhookAlertType('security_threat');
  }
}
