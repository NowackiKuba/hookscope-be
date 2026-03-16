import { Waitlist } from '@waitlist/domain/aggregates/waitlist';
import { WaitlistId } from '@waitlist/domain/value-objects/waitlist-id.vo';
import { WaitlistEmail } from '@waitlist/domain/value-objects/waitlist-email.vo';

export interface WaitlistRepositoryPort {
  create(waitlist: Waitlist): Promise<Waitlist>;
  update(waitlist: Waitlist): Promise<void>;
  delete(id: WaitlistId): Promise<void>;
  getById(id: WaitlistId): Promise<Waitlist | null>;
  existsByEmail(email: WaitlistEmail): Promise<boolean>;
}
