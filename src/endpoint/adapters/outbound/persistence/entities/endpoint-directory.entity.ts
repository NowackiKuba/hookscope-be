import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  Property,
} from '@mikro-orm/core';
import { BaseEntity } from '@orm/entities/base.entity';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';
import { EndpointEntity } from './endpoint.entity';
import { generateUUID } from '@shared/utils/generate-uuid';

export type EndpointDirectoryEntityProps = {
  id?: string;
  name: string;
  description?: string;
  user: UserEntity;
  endpoints?: Collection<EndpointEntity>;
  color?: string;
  icon?: string;
};

@Entity({ tableName: 'endpoint_directories' })
export class EndpointDirectoryEntity
  extends BaseEntity
  implements EndpointDirectoryEntityProps
{
  @Property({ type: 'text' })
  name: string;
  @Property({ type: 'text', nullable: true })
  description?: string;
  @ManyToOne(() => UserEntity)
  user: UserEntity;
  @OneToMany(() => EndpointEntity, (e) => e.directory)
  endpoints?: Collection<EndpointEntity>;
  @Property({ type: 'text', nullable: true })
  color?: string;
  @Property({ type: 'text', nullable: true })
  icon?: string;

  constructor(props: EndpointDirectoryEntityProps) {
    super();
    this.id = props.id ?? generateUUID();
    this.name = props.name;
    this.description = props.description;
    this.user = props.user;
    this.endpoints = props.endpoints;
    this.color = props.color;
    this.icon = props.icon;
  }
}
