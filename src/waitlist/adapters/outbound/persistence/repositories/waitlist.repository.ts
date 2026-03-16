import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { WaitlistRepositoryPort } from '@waitlist/domain/ports/outbound/persistence/repositories/waitlist.repository.port';
import { WaitlistMapper } from '../mappers/waitlist.mapper';
import { WaitlistEntity } from '../entities/waitlist.entity';
import { Waitlist } from '@waitlist/domain/aggregates/waitlist';
import { WaitlistId } from '@waitlist/domain/value-objects/waitlist-id.vo';
import { WaitlistEmail } from '@waitlist/domain/value-objects/waitlist-email.vo';

@Injectable()
export class WaitlistRepository implements WaitlistRepositoryPort {
  private readonly dbSource: EntityRepository<WaitlistEntity>;
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: WaitlistMapper,
  ) {
    this.dbSource = this.em.getRepository(WaitlistEntity);
  }

  async create(waitlist: Waitlist): Promise<Waitlist> {
    const res = this.dbSource.create(this.mapper.toEntity(waitlist));

    this.em.persist(res);

    await this.em.flush();

    return this.mapper.toDomain(res);
  }

  async delete(id: WaitlistId): Promise<void> {
    await this.dbSource.nativeDelete({ id: id.value });
  }

  async getById(id: WaitlistId): Promise<Waitlist | null> {
    const waitlist = await this.dbSource.findOne({ id: id.value });

    return waitlist ? this.mapper.toDomain(waitlist) : null;
  }

  async update(waitlist: Waitlist): Promise<void> {
    await this.dbSource.nativeUpdate(
      { id: waitlist.id.value },
      this.mapper.toEntity(waitlist),
    );
  }

  async existsByEmail(email: WaitlistEmail): Promise<boolean> {
    const count = await this.dbSource.count({ email: email.value });
    return count > 0;
  }
}
