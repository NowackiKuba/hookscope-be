import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { UsersSeeder } from './UsersSeeder';
import { RoomsSeeder } from './RoomsSeeder';
import { ReservationsSeeder } from './ReservationsSeeder';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await this.call(em, [UsersSeeder, RoomsSeeder, ReservationsSeeder]);
  }
}
