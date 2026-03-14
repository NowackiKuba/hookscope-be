import { Migration } from '@mikro-orm/migrations';

export class Migration20260309200848 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "payments" drop constraint "payments_invoice_id_foreign";`);

    this.addSql(`alter table "payments" alter column "invoice_id" drop default;`);
    this.addSql(`alter table "payments" alter column "invoice_id" type uuid using ("invoice_id"::text::uuid);`);
    this.addSql(`alter table "payments" alter column "invoice_id" drop not null;`);
    this.addSql(`alter table "payments" add constraint "payments_invoice_id_foreign" foreign key ("invoice_id") references "invoices" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "payments" drop constraint "payments_invoice_id_foreign";`);

    this.addSql(`alter table "payments" alter column "invoice_id" drop default;`);
    this.addSql(`alter table "payments" alter column "invoice_id" type uuid using ("invoice_id"::text::uuid);`);
    this.addSql(`alter table "payments" alter column "invoice_id" set not null;`);
    this.addSql(`alter table "payments" add constraint "payments_invoice_id_foreign" foreign key ("invoice_id") references "invoices" ("id") on update cascade;`);
  }

}
