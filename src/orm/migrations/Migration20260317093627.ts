import { Migration } from '@mikro-orm/migrations';

export class Migration20260317093627 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "retries" add column "custom_body" jsonb null, add column "custom_headers" jsonb null;`);
    this.addSql(`alter table "retries" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "retries" alter column "created_at" set default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table "retries" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
    this.addSql(`alter table "retries" alter column "updated_at" set default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table "retries" add constraint "retries_request_id_unique" unique ("request_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "retries" drop constraint "retries_request_id_unique";`);
    this.addSql(`alter table "retries" drop column "custom_body", drop column "custom_headers";`);

    this.addSql(`alter table "retries" alter column "created_at" drop default;`);
    this.addSql(`alter table "retries" alter column "created_at" type timestamptz(6) using ("created_at"::timestamptz(6));`);
    this.addSql(`alter table "retries" alter column "updated_at" drop default;`);
    this.addSql(`alter table "retries" alter column "updated_at" type timestamptz(6) using ("updated_at"::timestamptz(6));`);
  }

}
