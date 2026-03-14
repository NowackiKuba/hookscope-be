import { Migration } from '@mikro-orm/migrations';

export class Migration20260314171016 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "email_outbox" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "to" text not null, "subject" text not null, "template" text not null, "context" jsonb not null, "status" text not null default 'pending', "attempts" int not null default 0, "max_attempts" int not null default 5, "last_error" text null, "sent_at" timestamptz null, constraint "email_outbox_pkey" primary key ("id"));`);
    this.addSql(`create index "email_outbox_created_at_index" on "email_outbox" ("created_at");`);
    this.addSql(`create index "email_outbox_status_index" on "email_outbox" ("status");`);

    this.addSql(`create table "users" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "first_name" text not null, "last_name" text not null, "username" text not null, "email" text not null, "password" text not null, "avatar_url" text null, "role" text not null default 'USER', "is_active" boolean not null default true, "reset_password_token" text null, "reset_password_token_expires_at" timestamptz null, "created_by" text null, "created_by_id" uuid null, constraint "users_pkey" primary key ("id"));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "email_outbox" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);
  }

}
