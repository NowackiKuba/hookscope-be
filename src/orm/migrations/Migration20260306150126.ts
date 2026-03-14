import { Migration } from '@mikro-orm/migrations';

export class Migration20260306150126 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "email_outbox" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "to" text not null, "subject" text not null, "template" text not null, "context" jsonb not null, "status" text not null default 'pending', "attempts" int not null default 0, "max_attempts" int not null default 5, "last_error" text null, "sent_at" timestamptz null, constraint "email_outbox_pkey" primary key ("id"));`);
    this.addSql(`create index "email_outbox_created_at_index" on "email_outbox" ("created_at");`);
    this.addSql(`create index "email_outbox_status_index" on "email_outbox" ("status");`);

    this.addSql(`alter table "customer_comments" drop constraint "customer_comments_customer_id_foreign";`);

    this.addSql(`alter table "action_logs" drop constraint "action_logs_user_id_foreign";`);

    this.addSql(`alter table "users" add column "is_active" boolean not null default false, add column "created_by_id" uuid null;`);
    this.addSql(`alter table "users" add constraint "users_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "customer_comments" add constraint "customer_comments_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade;`);

    this.addSql(`drop index "action_logs_created_at_index";`);
    this.addSql(`drop index "action_logs_resource_type_resource_id_index";`);
    this.addSql(`drop index "action_logs_user_id_index";`);

    this.addSql(`alter table "action_logs" add constraint "action_logs_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "email_outbox" cascade;`);

    this.addSql(`alter table "action_logs" drop constraint "action_logs_user_id_foreign";`);

    this.addSql(`alter table "customer_comments" drop constraint "customer_comments_customer_id_foreign";`);

    this.addSql(`alter table "users" drop constraint "users_created_by_id_foreign";`);

    this.addSql(`alter table "action_logs" add constraint "action_logs_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`);
    this.addSql(`create index "action_logs_created_at_index" on "action_logs" ("created_at");`);
    this.addSql(`create index "action_logs_resource_type_resource_id_index" on "action_logs" ("resource_type", "resource_id");`);
    this.addSql(`create index "action_logs_user_id_index" on "action_logs" ("user_id");`);

    this.addSql(`alter table "customer_comments" add constraint "customer_comments_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "users" drop column "is_active", drop column "created_by_id";`);
  }

}
