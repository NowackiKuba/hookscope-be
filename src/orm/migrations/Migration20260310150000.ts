import { Migration } from '@mikro-orm/migrations';

export class Migration20260310150000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      alter table "settings"
        add column if not exists "hotel_city" text not null default '',
        add column if not exists "hotel_postal_code" text not null default '',
        add column if not exists "hotel_website" text null,
        add column if not exists "logo_url" text null,
        add column if not exists "check_in_instructions" text null,
        add column if not exists "reception_phone" text null,
        add column if not exists "notification_email" text null,
        add column if not exists "invoice_payment_deadline_days" int not null default 14,
        add column if not exists "invoice_counter_reset" text not null default 'yearly',
        add column if not exists "invoice_start_number" int not null default 1,
        add column if not exists "vat_rate" double precision not null default 23,
        add column if not exists "cancellation_deadline_hours" int not null default 24,
        add column if not exists "unpaid_reservation_timeout_hours" int not null default 24,
        add column if not exists "auto_confirm_reservations" boolean not null default false,
        add column if not exists "auto_release_unpaid_reservations" boolean not null default true,
        add column if not exists "auto_send_confirmation_email" boolean not null default false,
        add column if not exists "auto_send_reminder_email" boolean not null default false,
        add column if not exists "reminder_email_hours_before" int not null default 24,
        add column if not exists "auto_send_checkout_email" boolean not null default false,
        add column if not exists "auto_generate_invoice" boolean not null default false,
        add column if not exists "wifi_name" text null,
        add column if not exists "wifi_password" text null,
        add column if not exists "amenities" json not null default '[]',
        add column if not exists "google_review_url" text null;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      alter table "settings"
        drop column if exists "hotel_city",
        drop column if exists "hotel_postal_code",
        drop column if exists "hotel_website",
        drop column if exists "logo_url",
        drop column if exists "check_in_instructions",
        drop column if exists "reception_phone",
        drop column if exists "notification_email",
        drop column if exists "invoice_payment_deadline_days",
        drop column if exists "invoice_counter_reset",
        drop column if exists "invoice_start_number",
        drop column if exists "vat_rate",
        drop column if exists "cancellation_deadline_hours",
        drop column if exists "unpaid_reservation_timeout_hours",
        drop column if exists "auto_confirm_reservations",
        drop column if exists "auto_release_unpaid_reservations",
        drop column if exists "auto_send_confirmation_email",
        drop column if exists "auto_send_reminder_email",
        drop column if exists "reminder_email_hours_before",
        drop column if exists "auto_send_checkout_email",
        drop column if exists "auto_generate_invoice",
        drop column if exists "wifi_name",
        drop column if exists "wifi_password",
        drop column if exists "amenities",
        drop column if exists "google_review_url";
    `);
  }
}
