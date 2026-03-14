import { Migration } from '@mikro-orm/migrations';

export class Migration20260310120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "invoices" add column "pdf_url" text null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "invoices" drop column "pdf_url";`);
  }
}
