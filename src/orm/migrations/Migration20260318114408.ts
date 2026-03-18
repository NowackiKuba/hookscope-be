import { Migration } from '@mikro-orm/migrations';

export class Migration20260318114408 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "cli_tokens" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "user_id" uuid not null, "token_hash" text not null, "prefix" text not null, "last_used_at" timestamptz null, constraint "cli_tokens_pkey" primary key ("id"));`);
    this.addSql(`alter table "cli_tokens" add constraint "cli_tokens_user_id_unique" unique ("user_id");`);
    this.addSql(`alter table "cli_tokens" add constraint "cli_tokens_token_hash_unique" unique ("token_hash");`);

    this.addSql(`alter table "cli_tokens" add constraint "cli_tokens_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);

    this.addSql(
      `alter table "subscriptions" drop constraint if exists "subscriptions_user_unique";`,
    );
    this.addSql(`alter table "subscriptions" add constraint "subscriptions_user_id_unique" unique ("user_id");`);
    this.addSql(
      `alter table "subscriptions" drop constraint if exists "subscriptions_stripe_subscription_unique";`,
    );
    this.addSql(`alter table "subscriptions" add constraint "subscriptions_stripe_subscription_id_unique" unique ("stripe_subscription_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "cli_tokens" cascade;`);

    this.addSql(
      `alter table "subscriptions" drop constraint if exists "subscriptions_stripe_subscription_id_unique";`,
    );
    this.addSql(`alter table "subscriptions" add constraint "subscriptions_stripe_subscription_unique" unique ("stripe_subscription_id");`);
    this.addSql(
      `alter table "subscriptions" drop constraint if exists "subscriptions_user_id_unique";`,
    );
    this.addSql(`alter table "subscriptions" add constraint "subscriptions_user_unique" unique ("user_id");`);
  }

}
