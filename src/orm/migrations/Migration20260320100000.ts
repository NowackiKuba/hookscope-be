import { Migration } from '@mikro-orm/migrations';

export class Migration20260320100000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "webhook_alerts" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "endpoint_id" uuid not null, "user_id" uuid not null, "type" text not null, "status" text not null, "event_type" text null, "metadata" jsonb null, constraint "webhook_alerts_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "webhook_alerts" add constraint "webhook_alerts_endpoint_id_foreign" foreign key ("endpoint_id") references "endpoints" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "webhook_alerts" add constraint "webhook_alerts_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `create index "webhook_alerts_user_id_created_at_index" on "webhook_alerts" ("user_id", "created_at");`,
    );
    this.addSql(
      `create index "webhook_alerts_endpoint_id_created_at_index" on "webhook_alerts" ("endpoint_id", "created_at");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "webhook_alerts" cascade;`);
  }
}
