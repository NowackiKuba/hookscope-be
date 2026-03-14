import { Migration } from '@mikro-orm/migrations';

export class Migration20260309191853 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "invoices" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "number" int not null, "full_number" text not null, "reservation_id" uuid null, "customer_id" uuid not null, "payment_id" uuid null, "status" text not null, "issue_date" date not null, "sale_date" date not null, "due_date" date not null, "seller_name" text not null, "seller_address" text not null, "seller_nip" text not null, "seller_bank_account" text not null, "buyer_name" text not null, "buyer_address" text not null, "buyer_nip" text null, "buyer_email" text null, "items" jsonb not null, "total_net" numeric(12,2) not null, "total_vat" numeric(12,2) not null, "total_gross" numeric(12,2) not null, "currency" text not null, "external_id" text null, "notes" text null, "footer" text null, "locale" text not null, constraint "invoices_pkey" primary key ("id"));`);

    this.addSql(`alter table "invoices" add constraint "invoices_reservation_id_foreign" foreign key ("reservation_id") references "reservations" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "invoices" add constraint "invoices_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade;`);
    this.addSql(`alter table "invoices" add constraint "invoices_payment_id_foreign" foreign key ("payment_id") references "payments" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "customers" add column "company" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "invoices" cascade;`);

    this.addSql(`alter table "customers" drop column "company";`);
  }

}
