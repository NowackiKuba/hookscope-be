import { Migration } from '@mikro-orm/migrations';

export class Migration20260315120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "users" add column if not exists "username" text null, add column if not exists "avatar_url" text null;`,
    );
    this.addSql(
      `update "users" set "username" = split_part("email", '@', 1) where "username" is null;`,
    );
    this.addSql(
      `alter table "users" alter column "username" set not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users" drop column if exists "username", drop column if exists "avatar_url";`);
  }
}
