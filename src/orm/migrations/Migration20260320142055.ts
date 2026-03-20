import { Migration } from '@mikro-orm/migrations';

export class Migration20260320142055 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "webhook_alerts" add column "scanner_status" text not null default 'active';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "webhook_alerts" drop column "scanner_status";`);
  }

}
