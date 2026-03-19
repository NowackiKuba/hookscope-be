import { generateUUID } from '@shared/utils/generate-uuid';
import {
  NotificationChannel,
  NotificationChannelValue,
} from '../value-objects/notification-channel.vo';
import { NotificationId } from '../value-objects/notification-id.vo';
import {
  NotificationStatus,
  NotificationStatusValue,
} from '../value-objects/notification-status.vo';

export type NotificationProps = {
  id?: string;
  userId: string;
  channel: string;
  status: string;
  referenceId: string;
  payload: Record<string, unknown>;
  failedReason?: string;
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type NotificationJSON = {
  id: string;
  userId: string;
  channel: NotificationChannelValue;
  status: NotificationStatusValue;
  referenceId: string;
  payload: Record<string, unknown>;
  failedReason?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class Notification {
  private _id: NotificationId;
  private _userId: string;
  private _channel: NotificationChannel;
  private _status: NotificationStatus;
  private _referenceId: string;
  private _payload: Record<string, unknown>;
  private _failedReason?: string;
  private _sentAt?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: NotificationProps) {
    this._id = NotificationId.create(props.id ?? generateUUID());
    this._userId = props.userId;
    this._channel = NotificationChannel.create(props.channel);
    this._status = NotificationStatus.create(props.status);
    this._referenceId = props.referenceId;
    this._payload = props.payload;
    this._failedReason = props.failedReason;
    this._sentAt = props.sentAt;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: NotificationProps) {
    return new Notification(props);
  }

  get id(): NotificationId {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get channel(): NotificationChannel {
    return this._channel;
  }
  get status(): NotificationStatus {
    return this._status;
  }
  get referenceId(): string {
    return this._referenceId;
  }
  get payload(): Record<string, unknown> {
    return this._payload;
  }
  get failedReason(): string {
    return this._failedReason;
  }
  get sentAt(): Date {
    return this._sentAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON(): NotificationJSON {
    return {
      id: this._id.value,
      userId: this._userId,
      channel: this._channel.value,
      status: this._status.value,
      referenceId: this._referenceId,
      payload: this._payload,
      failedReason: this._failedReason,
      sentAt: this._sentAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
