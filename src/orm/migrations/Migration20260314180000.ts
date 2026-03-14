import { Migration } from '@mikro-orm/migrations';

export class Migration20260314180000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "endpoints" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "user_id" uuid not null, "name" text not null, "token" text not null, constraint "endpoints_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "endpoints" add constraint "endpoints_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(`create unique index "endpoints_token_unique" on "endpoints" ("token");`);

    this.addSql(
      `create table "requests" ("id" uuid not null default gen_random_uuid(), "endpoint_id" uuid not null, "method" text not null, "headers" jsonb not null default '{}', "body" jsonb null, "query" jsonb not null default '{}', "ip" text null, "content_type" text null, "size" int not null default 0, "overlimit" boolean not null default false, "received_at" timestamptz not null default NOW(), constraint "requests_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "requests" add constraint "requests_endpoint_id_foreign" foreign key ("endpoint_id") references "endpoints" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `create index "requests_endpoint_id_received_at_index" on "requests" ("endpoint_id", "received_at" desc);`,
    );
    this.addSql(
      `create index "requests_endpoint_id_overlimit_index" on "requests" ("endpoint_id", "overlimit");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "requests" cascade;`);
    this.addSql(`drop table if exists "endpoints" cascade;`);
  }
}
