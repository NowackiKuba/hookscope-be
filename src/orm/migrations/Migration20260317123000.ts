import { Migration } from '@mikro-orm/migrations';

export class Migration20260317123000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "packets" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "name" text not null, "code" text not null, "description" text not null default '', "unit_amount" int not null, "currency" text not null, "interval" text not null, "features" jsonb not null, "is_active" boolean not null default true, "stripe_product_id" text null, "stripe_price_id" text null, constraint "packets_pkey" primary key ("id"));`,
    );
    this.addSql(
      `create unique index if not exists "packets_code_unique" on "packets" ("code");`,
    );

    this.addSql(
      `create table if not exists "subscriptions" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "user_id" uuid not null, "packet_id" uuid not null, "stripe_customer_id" text not null, "stripe_subscription_id" text not null, "stripe_price_id" text not null, "status" text not null, "current_period_end" timestamptz null, "cancel_at_period_end" boolean not null default false, "canceled_at" timestamptz null, "metadata" jsonb null, constraint "subscriptions_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "subscriptions" add constraint "subscriptions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "subscriptions" add constraint "subscriptions_packet_id_foreign" foreign key ("packet_id") references "packets" ("id") on update cascade on delete restrict;`,
    );
    this.addSql(
      `create unique index if not exists "subscriptions_user_unique" on "subscriptions" ("user_id");`,
    );
    this.addSql(
      `create unique index if not exists "subscriptions_stripe_subscription_unique" on "subscriptions" ("stripe_subscription_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "subscriptions" cascade;`);
    this.addSql(`drop table if exists "packets" cascade;`);
  }
}

