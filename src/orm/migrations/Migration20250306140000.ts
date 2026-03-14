import { Migration } from '@mikro-orm/migrations';

export class Migration20250306140000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table "notifications" (
        "id" uuid not null default gen_random_uuid(),
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        "title" text not null,
        "body" text not null,
        "type" text not null,
        "status" text not null,
        "user_id" uuid not null,
        "read_at" timestamptz null,
        "action_url" text null,
        "resource_type" text null,
        "resource_id" uuid null,
        "priority" text null,
        "metadata" jsonb null,
        "expires_at" timestamptz null,
        "created_by_id" uuid null,
        constraint "notifications_pkey" primary key ("id")
      );
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "notifications" cascade;`);
  }
}
