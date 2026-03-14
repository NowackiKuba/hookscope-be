import { Migration } from '@mikro-orm/migrations';

export class Migration20260303152430 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "reservations" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "guest" jsonb not null, "check_in" timestamptz not null, "check_out" timestamptz not null, "guests_count" int not null, "source" text not null, "status" text not null, "total_amount" int not null, "deposit_amount" int null, "remaining_amount" int not null, "payment_status" text not null, "notes" text null, "created_by_source" text not null, "created_by_id" uuid null, constraint "reservations_pkey" primary key ("id"));`);

    this.addSql(`create table "reservation-rooms" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "room_id" uuid not null, "reservation_id" uuid not null, "price_per_night" int not null, constraint "reservation-rooms_pkey" primary key ("id"));`);

    this.addSql(`alter table "reservations" add constraint "reservations_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "reservation-rooms" add constraint "reservation-rooms_room_id_foreign" foreign key ("room_id") references "rooms" ("id") on update cascade;`);
    this.addSql(`alter table "reservation-rooms" add constraint "reservation-rooms_reservation_id_foreign" foreign key ("reservation_id") references "reservations" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "reservation-rooms" drop constraint "reservation-rooms_reservation_id_foreign";`);

    this.addSql(`drop table if exists "reservations" cascade;`);

    this.addSql(`drop table if exists "reservation-rooms" cascade;`);
  }

}
