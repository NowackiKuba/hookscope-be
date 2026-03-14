import { Migration } from '@mikro-orm/migrations';

export class Migration20260308222953 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "notifications" alter column "resource_id" type text using ("resource_id"::text);`);

    this.addSql(`alter table "rooms" add column "cleaning_started_at" timestamptz null;`);

    this.addSql(`alter table "notifications" alter column "resource_id" type text using ("resource_id"::text);`);
    this.addSql(`alter table "notifications" add constraint "notifications_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "notifications" drop constraint "notifications_created_by_id_foreign";`);

    this.addSql(`alter table "notifications" alter column "resource_id" drop default;`);
    this.addSql(`alter table "notifications" alter column "resource_id" type uuid using ("resource_id"::text::uuid);`);

    this.addSql(`alter table "rooms" drop column "cleaning_started_at";`);
  }

}
