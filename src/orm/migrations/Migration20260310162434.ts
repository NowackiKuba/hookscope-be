import { Migration } from '@mikro-orm/migrations';

export class Migration20260310162434 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "rooms" add column "default_price_list_id" text not null;`);

    this.addSql(`alter table "settings" alter column "hotel_city" drop default;`);
    this.addSql(`alter table "settings" alter column "hotel_city" type text using ("hotel_city"::text);`);
    this.addSql(`alter table "settings" alter column "hotel_postal_code" drop default;`);
    this.addSql(`alter table "settings" alter column "hotel_postal_code" type text using ("hotel_postal_code"::text);`);
    this.addSql(`alter table "settings" alter column "invoice_payment_deadline_days" drop default;`);
    this.addSql(`alter table "settings" alter column "invoice_payment_deadline_days" type int using ("invoice_payment_deadline_days"::int);`);
    this.addSql(`alter table "settings" alter column "invoice_counter_reset" drop default;`);
    this.addSql(`alter table "settings" alter column "invoice_counter_reset" type text using ("invoice_counter_reset"::text);`);
    this.addSql(`alter table "settings" alter column "invoice_start_number" drop default;`);
    this.addSql(`alter table "settings" alter column "invoice_start_number" type int using ("invoice_start_number"::int);`);
    this.addSql(`alter table "settings" alter column "vat_rate" drop default;`);
    this.addSql(`alter table "settings" alter column "vat_rate" type real using ("vat_rate"::real);`);
    this.addSql(`alter table "settings" alter column "cancellation_deadline_hours" drop default;`);
    this.addSql(`alter table "settings" alter column "cancellation_deadline_hours" type int using ("cancellation_deadline_hours"::int);`);
    this.addSql(`alter table "settings" alter column "unpaid_reservation_timeout_hours" drop default;`);
    this.addSql(`alter table "settings" alter column "unpaid_reservation_timeout_hours" type int using ("unpaid_reservation_timeout_hours"::int);`);
    this.addSql(`alter table "settings" alter column "auto_confirm_reservations" drop default;`);
    this.addSql(`alter table "settings" alter column "auto_confirm_reservations" type boolean using ("auto_confirm_reservations"::boolean);`);
    this.addSql(`alter table "settings" alter column "auto_send_confirmation_email" drop default;`);
    this.addSql(`alter table "settings" alter column "auto_send_confirmation_email" type boolean using ("auto_send_confirmation_email"::boolean);`);
    this.addSql(`alter table "settings" alter column "auto_send_reminder_email" drop default;`);
    this.addSql(`alter table "settings" alter column "auto_send_reminder_email" type boolean using ("auto_send_reminder_email"::boolean);`);
    this.addSql(`alter table "settings" alter column "reminder_email_hours_before" drop default;`);
    this.addSql(`alter table "settings" alter column "reminder_email_hours_before" type int using ("reminder_email_hours_before"::int);`);
    this.addSql(`alter table "settings" alter column "auto_send_checkout_email" drop default;`);
    this.addSql(`alter table "settings" alter column "auto_send_checkout_email" type boolean using ("auto_send_checkout_email"::boolean);`);
    this.addSql(`alter table "settings" alter column "auto_generate_invoice" drop default;`);
    this.addSql(`alter table "settings" alter column "auto_generate_invoice" type boolean using ("auto_generate_invoice"::boolean);`);
    this.addSql(`alter table "settings" alter column "amenities" drop default;`);
    this.addSql(`alter table "settings" alter column "amenities" type jsonb using ("amenities"::jsonb);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "rooms" drop column "default_price_list_id";`);

    this.addSql(`alter table "settings" alter column "hotel_city" type text using ("hotel_city"::text);`);
    this.addSql(`alter table "settings" alter column "hotel_city" set default '';`);
    this.addSql(`alter table "settings" alter column "hotel_postal_code" type text using ("hotel_postal_code"::text);`);
    this.addSql(`alter table "settings" alter column "hotel_postal_code" set default '';`);
    this.addSql(`alter table "settings" alter column "invoice_payment_deadline_days" type int4 using ("invoice_payment_deadline_days"::int4);`);
    this.addSql(`alter table "settings" alter column "invoice_payment_deadline_days" set default 14;`);
    this.addSql(`alter table "settings" alter column "invoice_counter_reset" type text using ("invoice_counter_reset"::text);`);
    this.addSql(`alter table "settings" alter column "invoice_counter_reset" set default 'yearly';`);
    this.addSql(`alter table "settings" alter column "invoice_start_number" type int4 using ("invoice_start_number"::int4);`);
    this.addSql(`alter table "settings" alter column "invoice_start_number" set default 1;`);
    this.addSql(`alter table "settings" alter column "vat_rate" type float8 using ("vat_rate"::float8);`);
    this.addSql(`alter table "settings" alter column "vat_rate" set default 23;`);
    this.addSql(`alter table "settings" alter column "cancellation_deadline_hours" type int4 using ("cancellation_deadline_hours"::int4);`);
    this.addSql(`alter table "settings" alter column "cancellation_deadline_hours" set default 24;`);
    this.addSql(`alter table "settings" alter column "unpaid_reservation_timeout_hours" type int4 using ("unpaid_reservation_timeout_hours"::int4);`);
    this.addSql(`alter table "settings" alter column "unpaid_reservation_timeout_hours" set default 24;`);
    this.addSql(`alter table "settings" alter column "auto_confirm_reservations" type bool using ("auto_confirm_reservations"::bool);`);
    this.addSql(`alter table "settings" alter column "auto_confirm_reservations" set default false;`);
    this.addSql(`alter table "settings" alter column "auto_release_unpaid_reservations" type bool using ("auto_release_unpaid_reservations"::bool);`);
    this.addSql(`alter table "settings" alter column "auto_release_unpaid_reservations" set default true;`);
    this.addSql(`alter table "settings" alter column "auto_send_confirmation_email" type bool using ("auto_send_confirmation_email"::bool);`);
    this.addSql(`alter table "settings" alter column "auto_send_confirmation_email" set default false;`);
    this.addSql(`alter table "settings" alter column "auto_send_reminder_email" type bool using ("auto_send_reminder_email"::bool);`);
    this.addSql(`alter table "settings" alter column "auto_send_reminder_email" set default false;`);
    this.addSql(`alter table "settings" alter column "reminder_email_hours_before" type int4 using ("reminder_email_hours_before"::int4);`);
    this.addSql(`alter table "settings" alter column "reminder_email_hours_before" set default 24;`);
    this.addSql(`alter table "settings" alter column "auto_send_checkout_email" type bool using ("auto_send_checkout_email"::bool);`);
    this.addSql(`alter table "settings" alter column "auto_send_checkout_email" set default false;`);
    this.addSql(`alter table "settings" alter column "auto_generate_invoice" type bool using ("auto_generate_invoice"::bool);`);
    this.addSql(`alter table "settings" alter column "auto_generate_invoice" set default false;`);
    this.addSql(`alter table "settings" alter column "amenities" type json using ("amenities"::json);`);
    this.addSql(`alter table "settings" alter column "amenities" set default '[]';`);
  }

}
