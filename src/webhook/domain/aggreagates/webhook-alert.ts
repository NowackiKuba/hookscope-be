import {
  AlertMetadata,
  AlertMetadataValue,
} from '../value-objects/alert-metadata.vo';
import { WebhookAlertId } from '../value-objects/webhook-alert-id.vo';
import {
  WebhookAlertStatus,
  WebhookAlertStatusValue,
} from '../value-objects/webhook-status.vo';
import {
  WebhookAlertType,
  WebhookAlertTypeValue,
} from '../value-objects/webhook-type.vo';

export type WebhookAlertProps = {
  id?: string;
  endpointId: string;
  userId: string;
  type: string;
  status: string;
  eventType?: string;
  metadata?: AlertMetadataValue;
  createdAt?: Date;
  updatedAt?: Date;
};

export type WebhookAlertJSON = {
  id: string;
  endpointId: string;
  userId: string;
  type: WebhookAlertTypeValue;
  status: WebhookAlertStatusValue;
  eventType?: string;
  metadata?: AlertMetadataValue;
  createdAt: Date;
  updatedAt: Date;
};

export class WebhookAlert {
  private _id: WebhookAlertId;
  private _endpointId: string;
  private _userId: string;
  private _type: WebhookAlertType;
  private _status: WebhookAlertStatus;
  private _eventType?: string;
  private _metadata?: AlertMetadata;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: WebhookAlertProps) {
    this._id = WebhookAlertId.create(props.id);
    this._endpointId = props.endpointId;
    this._userId = props.userId;
    this._type = WebhookAlertType.create(props.type);
    this._status = WebhookAlertStatus.create(props.status);
    this._eventType = props.eventType;
    this._metadata =
      props.metadata != null
        ? AlertMetadata.create(props.metadata)
        : undefined;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: WebhookAlertProps) {
    return new WebhookAlert(props);
  }

  get id(): WebhookAlertId {
    return this._id;
  }
  get endpointId(): string {
    return this._endpointId;
  }
  get userId(): string {
    return this._userId;
  }
  get type(): WebhookAlertType {
    return this._type;
  }
  get status(): WebhookAlertStatus {
    return this._status;
  }
  get eventType(): string | undefined {
    return this._eventType;
  }
  get metadata(): AlertMetadata | undefined {
    return this._metadata;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON(): WebhookAlertJSON {
    return {
      id: this._id.value,
      endpointId: this._endpointId,
      userId: this._userId,
      type: this._type.value,
      status: this._status.value,
      eventType: this._eventType,
      metadata: this._metadata?.value,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
