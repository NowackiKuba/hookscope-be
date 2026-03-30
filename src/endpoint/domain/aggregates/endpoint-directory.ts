import { generateUUID } from '@shared/utils/generate-uuid';
import { Endpoint } from './endpoint';
import { EndpointDirectoryId } from '../value-objects/endpoint-directory-id.vo';
import {
  EndpointDirectoryColor,
  EndpointDirectoryColorValue,
} from '../value-objects/endpoint-directory-color.vo';
import {
  EndpointDirectoryIcon,
  EndpointDirectoryIconValue,
} from '../value-objects/endpoint-directory-icon.vo';

export type EndpointDirectoryProps = {
  id?: string;
  name: string;
  description?: string;
  userId: string;
  endpoints?: Endpoint[];
  color?: string;
  icon?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type EndpointDirectoryJSON = {
  id: string;
  name: string;
  description?: string;
  userId: string;
  endpoints?: Endpoint[];
  color?: EndpointDirectoryColorValue;
  icon?: EndpointDirectoryIconValue;
  createdAt: Date;
  updatedAt: Date;
};

export class EndpointDirectory {
  private _id?: EndpointDirectoryId;
  private _name: string;
  private _description?: string;
  private _userId: string;
  private _endpoints?: Endpoint[];
  private _color?: EndpointDirectoryColor;
  private _icon?: EndpointDirectoryIcon;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  private constructor(props: EndpointDirectoryProps) {
    this._id = EndpointDirectoryId.create(props.id);
    this._name = props.name;
    this._description = props.description;
    this._userId = props.userId;
    this._endpoints = props.endpoints;
    this._color = EndpointDirectoryColor.create(props.color);
    this._icon = EndpointDirectoryIcon.create(props.icon);
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: {
    id?: string;
    name: string;
    description?: string;
    userId: string;
    color?: string;
    icon?: string;
  }) {
    return new EndpointDirectory({
      id: props.id ?? generateUUID(),
      name: props.name,
      description: props.description,
      color: props.color,
      icon: props.icon,
      userId: props.userId,
    });
  }

  static reconstitute(props: EndpointDirectoryProps) {
    return new EndpointDirectory(props);
  }

  get id(): EndpointDirectoryId {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get description(): string {
    return this._description;
  }
  get userId(): string {
    return this._userId;
  }
  get endpoints(): Endpoint[] {
    return this._endpoints;
  }
  get color(): EndpointDirectoryColor {
    return this._color;
  }
  get icon(): EndpointDirectoryIcon {
    return this._icon;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  toJSON(): EndpointDirectoryJSON {
    return {
      id: this._id.value,
      name: this._name,
      description: this._description,
      userId: this._userId,
      color: this._color.value,
      icon: this._icon.value,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
