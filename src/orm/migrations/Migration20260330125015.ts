import { Migration } from '@mikro-orm/migrations';

export class Migration20260330125015 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "endpoint_directories" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "name" text not null, "description" text null, "user_id" uuid not null, "color" text null, "icon" text null, constraint "endpoint_directories_pkey" primary key ("id"));`);

    this.addSql(`alter table "endpoint_directories" add constraint "endpoint_directories_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "endpoints" add column "directory_id" uuid not null;`);
    this.addSql(`alter table "endpoints" add constraint "endpoints_directory_id_foreign" foreign key ("directory_id") references "endpoint_directories" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "endpoints" drop constraint "endpoints_directory_id_foreign";`);

    this.addSql(`drop table if exists "endpoint_directories" cascade;`);

    this.addSql(`alter table "endpoints" drop column "directory_id";`);
  }

}
