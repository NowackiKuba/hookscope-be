import { Migration } from '@mikro-orm/migrations';

export class Migration20260315154906 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "endpoints" drop constraint "endpoints_user_id_foreign";`);

    this.addSql(`alter table "endpoints" add column "webhook_url" text null;`);

    this.addSql(`alter table "requests" alter column "headers" drop default;`);
    this.addSql(`alter table "requests" alter column "headers" type jsonb using ("headers"::jsonb);`);
    this.addSql(`alter table "requests" alter column "query" drop default;`);
    this.addSql(`alter table "requests" alter column "query" type jsonb using ("query"::jsonb);`);
    this.addSql(`alter table "requests" alter column "received_at" drop default;`);
    this.addSql(`alter table "requests" alter column "received_at" type timestamptz using ("received_at"::timestamptz);`);

    this.addSql(`alter table "retries" alter column "created_at" drop default;`);
    this.addSql(`alter table "retries" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "retries" alter column "updated_at" drop default;`);
    this.addSql(`alter table "retries" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "endpoints" drop column "webhook_url";`);

    this.addSql(`alter table "endpoints" add constraint "endpoints_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "requests" alter column "headers" type jsonb using ("headers"::jsonb);`);
    this.addSql(`alter table "requests" alter column "headers" set default '{}';`);
    this.addSql(`alter table "requests" alter column "query" type jsonb using ("query"::jsonb);`);
    this.addSql(`alter table "requests" alter column "query" set default '{}';`);
    this.addSql(`alter table "requests" alter column "received_at" type timestamptz(6) using ("received_at"::timestamptz(6));`);
    this.addSql(`alter table "requests" alter column "received_at" set default now();`);

    this.addSql(`alter table "retries" alter column "created_at" type timestamptz(6) using ("created_at"::timestamptz(6));`);
    this.addSql(`alter table "retries" alter column "created_at" set default now();`);
    this.addSql(`alter table "retries" alter column "updated_at" type timestamptz(6) using ("updated_at"::timestamptz(6));`);
    this.addSql(`alter table "retries" alter column "updated_at" set default now();`);
  }

}
