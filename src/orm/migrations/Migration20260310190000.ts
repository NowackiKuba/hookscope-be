import { Migration } from '@mikro-orm/migrations';

export class Migration20260310190000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "customers" alter column "email" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "customers" alter column "email" set not null;`,
    );
  }
}
