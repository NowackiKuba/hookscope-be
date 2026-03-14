import { Migration } from '@mikro-orm/migrations';

export class Migration20260310140000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "rooms" add column "active_price_list_id" uuid null;`,
    );
    this.addSql(`update "rooms" set "active_price_list_id" = "price_list_id";`);
    this.addSql(
      `alter table "rooms" drop constraint "rooms_price_list_id_foreign";`,
    );
    this.addSql(`alter table "rooms" drop column "price_list_id";`);
    this.addSql(
      `alter table "rooms" alter column "active_price_list_id" set not null;`,
    );
    this.addSql(
      `alter table "rooms" add constraint "rooms_active_price_list_id_foreign" foreign key ("active_price_list_id") references "price_lists" ("id") on update cascade;`,
    );

    this.addSql(
      `create table "room_price_lists" ("room_id" uuid not null, "price_list_id" uuid not null, constraint "room_price_lists_pkey" primary key ("room_id", "price_list_id"));`,
    );
    this.addSql(
      `alter table "room_price_lists" add constraint "room_price_lists_room_id_foreign" foreign key ("room_id") references "rooms" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `alter table "room_price_lists" add constraint "room_price_lists_price_list_id_foreign" foreign key ("price_list_id") references "price_lists" ("id") on update cascade on delete cascade;`,
    );
    this.addSql(
      `insert into "room_price_lists" ("room_id", "price_list_id") select "id", "active_price_list_id" from "rooms";`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "room_price_lists" cascade;`);

    this.addSql(
      `alter table "rooms" drop constraint "rooms_active_price_list_id_foreign";`,
    );
    this.addSql(
      `alter table "rooms" add column "price_list_id" uuid null;`,
    );
    this.addSql(
      `update "rooms" set "price_list_id" = "active_price_list_id";`,
    );
    this.addSql(
      `alter table "rooms" alter column "price_list_id" set not null;`,
    );
    this.addSql(
      `alter table "rooms" add constraint "rooms_price_list_id_foreign" foreign key ("price_list_id") references "price_lists" ("id") on update cascade;`,
    );
    this.addSql(`alter table "rooms" drop column "active_price_list_id";`);
  }
}
