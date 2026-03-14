import { Migration } from '@mikro-orm/migrations';

/**
 * Drop legacy user_id from notifications (replaced by created_by_id).
 * Safe to run multiple times (IF EXISTS).
 */
export class Migration20260311190000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "notifications" drop column if exists "user_id";`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "notifications" add column if not exists "user_id" uuid null;`,
    );
  }
}
