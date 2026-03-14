import { Migration } from '@mikro-orm/migrations';

export class Migration20250306120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "rooms" add column "beds_double" int not null default 0, add column "beds_single" int not null default 0;`,
    );
    this.addSql(`alter table "rooms" drop column "bed_type";`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "rooms" add column "bed_type" text null, drop column "beds_double", drop column "beds_single";`,
    );
  }
}
