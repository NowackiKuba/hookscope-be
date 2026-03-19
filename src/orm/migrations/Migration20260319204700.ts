import { Migration } from '@mikro-orm/migrations';

export class Migration20260319204700 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "notifications" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "user_id" uuid not null, "channel" text not null, "status" text not null, "reference_id" uuid not null, "payload" jsonb not null, "failed_reason" text null, "sent_at" timestamptz null, constraint "notifications_pkey" primary key ("id"));`);

    this.addSql(`alter table "notifications" add constraint "notifications_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "endpoints" add column "schemas" jsonb null, add column "last_schema_at" timestamptz null;`);

    this.addSql(`alter table "requests" add column "created_at" timestamptz not null default CURRENT_TIMESTAMP, add column "updated_at" timestamptz not null default CURRENT_TIMESTAMP, add column "payload_hash" text not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "notifications" cascade;`);

    this.addSql(`alter table "endpoints" drop column "schemas", drop column "last_schema_at";`);

    this.addSql(`alter table "requests" drop column "created_at", drop column "updated_at", drop column "payload_hash";`);
  }

}
