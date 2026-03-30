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
  id: string;
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
  createdAt?: Date;
  updatedAt?: Date;
};

export class EndpointDirectory {
  private _id: EndpointDirectoryId;
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
    this._color = EndpointDirectory.colorFromProps(props.color);
    this._icon = EndpointDirectory.iconFromProps(props.icon);
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  private static colorFromProps(
    v: string | undefined | null,
  ): EndpointDirectoryColor | undefined {
    if (v == null || String(v).trim() === '') {
      return undefined;
    }
    return EndpointDirectoryColor.create(v.trim());
  }

  private static iconFromProps(
    v: string | undefined | null,
  ): EndpointDirectoryIcon | undefined {
    if (v == null || String(v).trim() === '') {
      return undefined;
    }
    return EndpointDirectoryIcon.create(v.trim());
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
      userId: props.userId,
      color: props.color,
      icon: props.icon,
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
  get description(): string | undefined {
    return this._description;
  }
  get userId(): string {
    return this._userId;
  }
  get endpoints(): Endpoint[] {
    return this._endpoints;
  }
  get color(): EndpointDirectoryColor | undefined {
    return this._color;
  }
  get icon(): EndpointDirectoryIcon | undefined {
    return this._icon;
  }

  updateDetails(props: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
  }): void {
    if (props.name !== undefined) {
      const name = props.name.trim();
      if (!name) {
        throw new Error('endpoint directory name cannot be empty');
      }
      this._name = name;
    }
    if (props.description !== undefined) {
      const d = props.description.trim();
      this._description = d.length > 0 ? d : undefined;
    }
    if (props.color !== undefined) {
      this._color = EndpointDirectory.colorFromProps(props.color);
    }
    if (props.icon !== undefined) {
      this._icon = EndpointDirectory.iconFromProps(props.icon);
    }
    this._updatedAt = new Date();
  }
  get createdAt(): Date | undefined {
    return this._createdAt;
  }
  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  toJSON(): EndpointDirectoryJSON {
    return {
      id: this._id.value,
      name: this._name,
      description: this._description,
      userId: this._userId,
      color: this._color?.value,
      endpoints: this._endpoints,
      icon: this._icon?.value,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
