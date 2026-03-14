import { Migration } from '@mikro-orm/migrations';

export class Migration20260314200000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "endpoints" add column if not exists "description" text not null default '';`,
    );
    this.addSql(
      `alter table "endpoints" add column if not exists "is_active" boolean not null default true;`,
    );
    this.addSql(
      `alter table "endpoints" add column if not exists "target_url" text null;`,
    );
    this.addSql(
      `alter table "endpoints" add column if not exists "secret_key" text null;`,
    );
    this.addSql(
      `alter table "endpoints" add column if not exists "request_count" int not null default 0;`,
    );
    this.addSql(
      `alter table "endpoints" add column if not exists "last_request_at" timestamptz null;`,
    );

    this.addSql(
      `alter table "requests" add column if not exists "forward_status" int null;`,
    );
    this.addSql(
      `alter table "requests" add column if not exists "forwarded_at" timestamptz null;`,
    );
    this.addSql(
      `alter table "requests" add column if not exists "forward_error" text null;`,
    );

    this.addSql(
      `create table "retries" ("id" uuid not null default gen_random_uuid(), "request_id" uuid not null, "target_url" text not null, "status" text not null default 'pending', "attempt_count" int not null default 0, "last_attempt_at" timestamptz null, "next_attempt_at" timestamptz null, "response_status" int null, "response_body" text null, "created_at" timestamptz not null default NOW(), "updated_at" timestamptz not null default NOW(), constraint "retries_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "retries" add constraint "retries_request_id_foreign" foreign key ("request_id") references "requests" ("id") on update cascade on delete cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "retries" cascade;`);
    this.addSql(`alter table "requests" drop column if exists "forward_status";`);
    this.addSql(`alter table "requests" drop column if exists "forwarded_at";`);
    this.addSql(`alter table "requests" drop column if exists "forward_error";`);
    this.addSql(`alter table "endpoints" drop column if exists "description";`);
    this.addSql(`alter table "endpoints" drop column if exists "is_active";`);
    this.addSql(`alter table "endpoints" drop column if exists "target_url";`);
    this.addSql(`alter table "endpoints" drop column if exists "secret_key";`);
    this.addSql(`alter table "endpoints" drop column if exists "request_count";`);
    this.addSql(`alter table "endpoints" drop column if exists "last_request_at";`);
  }
}
