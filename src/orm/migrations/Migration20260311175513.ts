import { Migration } from '@mikro-orm/migrations';

export class Migration20260311175513 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "reservations" add column "cancellation_reason" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "reservations" drop column "cancellation_reason";`);

    this.addSql(`alter table "settings" alter column "auto_release_unpaid_reservations" type bool using ("auto_release_unpaid_reservations"::bool);`);
    this.addSql(`alter table "settings" alter column "auto_release_unpaid_reservations" set default true;`);
  }

}
