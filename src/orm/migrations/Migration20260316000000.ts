import { Migration } from '@mikro-orm/migrations';

export class Migration20260316000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "waitlists" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "email" text not null, "source" text null, "notified_at" timestamptz null, constraint "waitlists_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "waitlists" add constraint "waitlists_email_unique" unique ("email");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "waitlists" cascade;`);
  }
}
