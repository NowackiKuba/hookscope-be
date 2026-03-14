import { randomBytes } from 'crypto';
import { generateUUID } from '@shared/utils/generate-uuid';

export type EndpointProps = {
  id?: string;
  userId: string;
  name: string;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EndpointJSON = {
  id: string;
  userId: string;
  name: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Endpoint {
  private _id: string;
  private _userId: string;
  private _name: string;
  private _token: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: EndpointProps) {
    this._id = props.id ?? generateUUID();
    this._userId = props.userId;
    this._name = props.name;
    this._token = props.token;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: { userId: string; name: string }): Endpoint {
    const token = randomBytes(16).toString('hex');
    return new Endpoint({
      userId: props.userId,
      name: props.name,
      token,
    });
  }

  static reconstitute(props: EndpointProps): Endpoint {
    return new Endpoint(props);
  }

  get id(): string {
    return this._id;
  }
  get userId(): string {
    return this._userId;
  }
  get name(): string {
    return this._name;
  }
  get token(): string {
    return this._token;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON(): EndpointJSON {
    return {
      id: this._id,
      userId: this._userId,
      name: this._name,
      token: this._token,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
