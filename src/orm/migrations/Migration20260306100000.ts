import { Migration } from '@mikro-orm/migrations';

export class Migration20260306100000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "customers" (
        "id" uuid not null default gen_random_uuid(),
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        "first_name" text not null,
        "last_name" text not null,
        "email" text not null,
        "phone" text null,
        constraint "customers_pkey" primary key ("id"),
        constraint "customers_email_unique" unique ("email")
      );`,
    );

    this.addSql(
      `create table "customer_comments" (
        "id" uuid not null default gen_random_uuid(),
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        "customer_id" uuid not null,
        "comment" text not null,
        "sentiment" text null,
        "source" text null,
        "created_by_id" uuid null,
        constraint "customer_comments_pkey" primary key ("id"),
        constraint "customer_comments_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade on delete cascade,
        constraint "customer_comments_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null
      );`,
    );

    this.addSql(
      `alter table "reservations" add column "customer_id" uuid null;`,
    );
    this.addSql(
      `alter table "reservations" add constraint "reservations_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade on delete set null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "reservations" drop constraint "reservations_customer_id_foreign";`,
    );
    this.addSql(`alter table "reservations" drop column "customer_id";`);
    this.addSql(`drop table if exists "customer_comments" cascade;`);
    this.addSql(`drop table if exists "customers" cascade;`);
  }
}
