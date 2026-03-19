import { Migration } from '@mikro-orm/migrations';

export class Migration20260319133153 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop index "subscriptions_stripe_subscription_unique";`);
    this.addSql(`drop index "subscriptions_user_unique";`);

    this.addSql(`alter table "endpoints" add column "provider" text not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "endpoints" drop column "provider";`);

    this.addSql(`alter table "subscriptions" add constraint "subscriptions_stripe_subscription_unique" unique ("stripe_subscription_id");`);
    this.addSql(`alter table "subscriptions" add constraint "subscriptions_user_unique" unique ("user_id");`);
  }

}
