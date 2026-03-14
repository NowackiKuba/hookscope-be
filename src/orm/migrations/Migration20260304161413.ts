import { Migration } from '@mikro-orm/migrations';

export class Migration20260304161413 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "payments" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "reservation_id" uuid not null, "amount" numeric(10,0) not null, "type" text not null, "status" text not null, "p24order_id" text null, "p24transaction_id" text null, "p24token" text null, "p24amount" int null, "method" text not null, "paid_at" timestamptz null, constraint "payments_pkey" primary key ("id"));`);

    this.addSql(`alter table "payments" add constraint "payments_reservation_id_foreign" foreign key ("reservation_id") references "reservations" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "payments" cascade;`);
  }

}
