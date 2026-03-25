import { Migration } from '@mikro-orm/migrations';

export class Migration20260325092621 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "subscriptions" add column "tier" text not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "subscriptions" drop column "tier";`);
  }

}
