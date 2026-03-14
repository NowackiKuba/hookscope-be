import { Migration } from '@mikro-orm/migrations';

export class Migration20260309193039 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "invoices" drop constraint "invoices_payment_id_foreign";`);

    this.addSql(`alter table "invoices" drop column "payment_id";`);

    this.addSql(`alter table "payments" add column "invoice_id" uuid null;`);
    this.addSql(`alter table "payments" add constraint "payments_invoice_id_foreign" foreign key ("invoice_id") references "invoices" ("id") on update cascade;`);
    this.addSql(`alter table "payments" add constraint "payments_invoice_id_unique" unique ("invoice_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "payments" drop constraint "payments_invoice_id_foreign";`);

    this.addSql(`alter table "invoices" add column "payment_id" uuid null;`);
    this.addSql(`alter table "invoices" add constraint "invoices_payment_id_foreign" foreign key ("payment_id") references "payments" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "payments" drop constraint "payments_invoice_id_unique";`);
    this.addSql(`alter table "payments" drop column "invoice_id";`);
  }

}
