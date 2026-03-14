import { Migration } from '@mikro-orm/migrations';

export class Migration20260305120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "settings" (
        "id" uuid not null default gen_random_uuid(),
        "created_at" timestamptz not null default CURRENT_TIMESTAMP,
        "updated_at" timestamptz not null default CURRENT_TIMESTAMP,
        "hotel_name" text not null,
        "hotel_address" text not null,
        "hotel_phone" text not null,
        "hotel_email" text not null,
        "nip" text not null,
        "bank_account" text not null,
        "deposit_percentage" int not null,
        "check_in_time" text not null,
        "check_out_time" text not null,
        "invoice_prefix" text not null,
        "invoice_footer" text null,
        "booking_sync_enabled" boolean not null,
        "booking_sync_interval" int not null,
        "cleaning_duration_minutes" int not null,
        constraint "settings_pkey" primary key ("id")
      );`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "settings" cascade;`);
  }
}
