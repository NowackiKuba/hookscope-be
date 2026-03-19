export type SchemaDriftMetadata = {
  added: string[];
  removed: string[];
  typeChanged: { field: string; from: string; to: string }[];
  updatedDto: string | null;
};

export type EndpointErrorMetadata = {
  statusCode: number;
  responseBody: string | null;
  requestId: string;
};

export type SignatureFailedMetadata = {
  provider: string;
  ip: string;
  requestId: string;
};

export type DuplicateDetectedMetadata = {
  originalRequestId: string;
  duplicateRequestId: string;
};

export type VolumeSpikeMetadata = {
  normalRate: number;
  currentRate: number;
  multiplier: number;
};

export type SilenceDetectedMetadata = {
  lastSeenAt: Date;
  silenceDurationMinutes: number;
};

export type SecurityThreatMetadata = {
  ip: string;
  failedAttempts: number;
  windowMinutes: number;
};

export type AlertMetadataValue =
  | SchemaDriftMetadata
  | EndpointErrorMetadata
  | SignatureFailedMetadata
  | DuplicateDetectedMetadata
  | VolumeSpikeMetadata
  | SilenceDetectedMetadata
  | SecurityThreatMetadata;

export class AlertMetadata {
  private readonly _value: AlertMetadataValue;

  private constructor(value: AlertMetadataValue) {
    this._value = value;
  }

  static create(value: AlertMetadataValue): AlertMetadata {
    if (!value || typeof value !== 'object') {
      throw new Error('AlertMetadata must be a non-null object');
    }

    return new AlertMetadata(value);
  }

  get value(): AlertMetadataValue {
    return this._value;
  }

  toJSON(): AlertMetadataValue {
    return this._value;
  }

  equals(other: AlertMetadata): boolean {
    return JSON.stringify(this._value) === JSON.stringify(other._value);
  }
}
