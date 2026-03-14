import { Migration } from '@mikro-orm/migrations';

export class Migration20260303115404 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "rooms" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "name" text not null, "description" text not null, "price_per_night" int not null, "capacity" int not null, "floor" int null, "size" int null, "bed_type" text null, "amenities" jsonb null, "booking_ical_url" text null, "is_active" boolean not null default true, "status" text not null, constraint "rooms_pkey" primary key ("id"));`);

    this.addSql(`create table "room-photos" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "room_id" uuid not null, "url" text not null, "order" int not null, "is_primary" boolean not null, constraint "room-photos_pkey" primary key ("id"));`);

    this.addSql(`create table "users" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, "email" text not null, "password" text not null, "first_name" text not null, "last_name" text not null, "role" text check ("role" in ('USER', 'ADMIN')) not null, "reset_password_token" text null, "reset_password_token_expires_at" timestamptz null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`alter table "room-photos" add constraint "room-photos_room_id_foreign" foreign key ("room_id") references "rooms" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "room-photos" drop constraint "room-photos_room_id_foreign";`);

    this.addSql(`drop table if exists "rooms" cascade;`);

    this.addSql(`drop table if exists "room-photos" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);
  }

}
