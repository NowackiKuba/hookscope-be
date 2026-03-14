import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';
import { UserRole } from '@users/domain/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

const SEED_USERS = [
  {
    email: 'admin@borowa.pl',
    password: 'admin123',
    firstName: 'Jan',
    lastName: 'Kowalski',
    role: UserRole.ADMIN,
  },
  {
    email: 'recepcja@borowa.pl',
    password: 'recepcja123',
    firstName: 'Anna',
    lastName: 'Nowak',
    role: UserRole.USER,
  },
  {
    email: 'pracownik@borowa.pl',
    password: 'pracownik123',
    firstName: 'Piotr',
    lastName: 'Wisniewski',
    role: UserRole.USER,
  },
] as const;

export class UsersSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const saltRounds = 10;

    for (const u of SEED_USERS) {
      const existing = await em.findOne(UserEntity, { email: u.email });
      if (existing) continue;

      const hashedPassword = await bcrypt.hash(u.password, saltRounds);
      const username = u.email.split('@')[0] + '_' + Date.now().toString(36).slice(-6);
      em.create(UserEntity, {
        email: u.email,
        passwordHash: hashedPassword,
        username,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role === UserRole.ADMIN ? 'ADMIN' : 'USER',
      });
    }

    await em.flush();
  }
}
