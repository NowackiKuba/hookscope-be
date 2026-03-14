import { Migration } from '@mikro-orm/migrations';

export class Migration20260310130330 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "price_lists" add column "day_of_week" jsonb null, add column "valid_from" date null, add column "valid_to" date null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "price_lists" drop column "day_of_week", drop column "valid_from", drop column "valid_to";`);
  }

}
