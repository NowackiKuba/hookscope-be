import { generateUUID } from '@shared/utils/generate-uuid';
import { WaitlistId } from '../value-objects/waitlist-id.vo';
import { WaitlistEmail } from '../value-objects/waitlist-email.vo';
import { WaitlistSource } from '../value-objects/waitlist-source.vo';

export type WaitlistProps = {
  id?: string;
  email: string;
  source?: string | null;
  notifiedAt?: Date | null;
};

export type WaitlistJSON = {
  id: string;
  email: string;
  source: string | null;
  notifiedAt: Date | null;
};

export class Waitlist {
  private _id: WaitlistId;
  private _email: WaitlistEmail;
  private _source: WaitlistSource;
  private _notifiedAt: Date | null;

  private constructor(props: WaitlistProps) {
    this._id = WaitlistId.create(props.id ?? generateUUID());
    this._email = WaitlistEmail.create(props.email);
    this._source = WaitlistSource.create(props.source);
    this._notifiedAt = props.notifiedAt ?? null;
  }

  static create(props: WaitlistProps): Waitlist {
    return new Waitlist(props);
  }

  static reconstitute(props: WaitlistProps & { id: string }): Waitlist {
    return new Waitlist(props);
  }

  get id(): WaitlistId {
    return this._id;
  }

  get email(): WaitlistEmail {
    return this._email;
  }

  get source(): WaitlistSource {
    return this._source;
  }

  get notifiedAt(): Date | null {
    return this._notifiedAt;
  }

  markNotified(): void {
    this._notifiedAt = new Date();
  }

  toJSON(): WaitlistJSON {
    return {
      id: this._id.value,
      email: this._email.value,
      source: this._source.value,
      notifiedAt: this._notifiedAt,
    };
  }
}
