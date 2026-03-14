import { Migration } from '@mikro-orm/migrations';

export class Migration20260307120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "action_logs" (
        "id" uuid not null default gen_random_uuid(),
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        "user_id" uuid not null,
        "action" text not null,
        "resource_type" text not null,
        "resource_id" text null,
        "metadata" jsonb null,
        "ip_address" text null,
        "user_agent" text null,
        constraint "action_logs_pkey" primary key ("id"),
        constraint "action_logs_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade
      );`,
    );
    this.addSql(
      `create index "action_logs_user_id_index" on "action_logs" ("user_id");`,
    );
    this.addSql(
      `create index "action_logs_resource_type_resource_id_index" on "action_logs" ("resource_type", "resource_id");`,
    );
    this.addSql(
      `create index "action_logs_created_at_index" on "action_logs" ("created_at");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "action_logs" cascade;`);
  }
}
