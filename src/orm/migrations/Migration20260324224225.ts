import { Migration } from '@mikro-orm/migrations';

export class Migration20260324224225 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "endpoint_schemas" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "endpoint_id" uuid not null, "event_type" text null, "version" int not null default 1, "is_latest" boolean not null default true, "prev_version_id" uuid null, "schema" jsonb not null, "generated" jsonb not null, "alert_id" uuid null, "generated_at" timestamptz not null, constraint "endpoint_schemas_pkey" primary key ("id"));`,
    );

    this.addSql(`do $$ begin
      if not exists (select 1 from pg_constraint where conname = 'endpoint_schemas_alert_id_unique') then
        alter table "endpoint_schemas" add constraint "endpoint_schemas_alert_id_unique" unique ("alert_id");
      end if;
    end $$;`);

    this.addSql(`do $$ begin
      if not exists (select 1 from pg_constraint where conname = 'endpoint_schemas_endpoint_id_event_type_version_unique') then
        alter table "endpoint_schemas" add constraint "endpoint_schemas_endpoint_id_event_type_version_unique" unique ("endpoint_id", "event_type", "version");
      end if;
    end $$;`);

    this.addSql(`do $$ begin
      if not exists (select 1 from pg_constraint where conname = 'endpoint_schemas_endpoint_id_foreign') then
        alter table "endpoint_schemas" add constraint "endpoint_schemas_endpoint_id_foreign" foreign key ("endpoint_id") references "endpoints" ("id") on update cascade;
      end if;
    end $$;`);

    this.addSql(`do $$ begin
      if not exists (select 1 from pg_constraint where conname = 'endpoint_schemas_prev_version_id_foreign') then
        alter table "endpoint_schemas" add constraint "endpoint_schemas_prev_version_id_foreign" foreign key ("prev_version_id") references "endpoint_schemas" ("id") on update cascade on delete set null;
      end if;
    end $$;`);

    this.addSql(`do $$ begin
      if not exists (select 1 from pg_constraint where conname = 'endpoint_schemas_alert_id_foreign') then
        alter table "endpoint_schemas" add constraint "endpoint_schemas_alert_id_foreign" foreign key ("alert_id") references "webhook_alerts" ("id") on update cascade on delete set null;
      end if;
    end $$;`);

    this.addSql(
      `alter table "user_settings" add column if not exists "alert_email_address" text null;`,
    );
    this.addSql(
      `alter table "user_settings" alter column "volume_spike_multiplier" type real using ("volume_spike_multiplier"::real);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "endpoint_schemas" drop constraint if exists "endpoint_schemas_prev_version_id_foreign";`,
    );

    this.addSql(`drop table if exists "endpoint_schemas" cascade;`);

    this.addSql(
      `alter table "user_settings" drop column if exists "alert_email_address";`,
    );

    this.addSql(
      `alter table "user_settings" alter column "volume_spike_multiplier" type float8 using ("volume_spike_multiplier"::float8);`,
    );
  }
}
