import { Migration } from '@mikro-orm/migrations';

export class Migration20260310170000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "reservations" add column if not exists "booking_uid" text null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "reservations" drop column if exists "booking_uid";`);
  }
}
