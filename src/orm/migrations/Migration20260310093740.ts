import { Migration } from '@mikro-orm/migrations';

export class Migration20260310093740 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "rooms" add column "sort_index" serial;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "rooms" drop column "sort_index";`);
  }

}
