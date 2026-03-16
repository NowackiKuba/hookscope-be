import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { WaitlistEntity } from '../entities/waitlist.entity';
import { Waitlist } from '@waitlist/domain/aggregates/waitlist';

@Injectable()
export class WaitlistMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: WaitlistEntity): Waitlist {
    return Waitlist.create({
      ...entity,
    });
  }

  toEntity(domain: Waitlist): WaitlistEntity {
    const domainJSON = domain.toJSON();

    return new WaitlistEntity({
      ...domainJSON,
    });
  }
}
