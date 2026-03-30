import { Migration } from '@mikro-orm/migrations';

export class Migration20260325092621 extends Migration {

  override async up(): Promise<void> {
    this.addSql(
      `alter table "subscriptions" add column if not exists "tier" text;`,
    );
    this.addSql(
      `update "subscriptions" set "tier" = 'free' where "tier" is null;`,
    );
    this.addSql(
      `alter table "subscriptions" alter column "tier" set not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "subscriptions" drop column if exists "tier";`);
  }

}
