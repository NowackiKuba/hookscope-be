import { Migration } from '@mikro-orm/migrations';

export class Migration20260320183000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "user_settings" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "user_id" uuid not null, "auto_generation_targets" jsonb not null, "manual_generation_targets" jsonb not null, "notification_channels" jsonb not null, "slack_webhook_url" text null, "discord_webhook_url" text null, "default_silence_threshold" int not null, "volume_spike_multiplier" double precision not null, "language" text not null, "theme" text not null, constraint "user_settings_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "user_settings" add constraint "user_settings_user_id_unique" unique ("user_id");`,
    );
    this.addSql(
      `alter table "user_settings" add constraint "user_settings_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user_settings" cascade;`);
  }
}
