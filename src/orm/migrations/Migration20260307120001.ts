import { Migration } from '@mikro-orm/migrations';

/**
 * Notifications are system-wide; remove user_id column.
 * Safe when "notifications" table does not exist (e.g. older DB state).
 */
export class Migration20260307120001 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'notifications'
        ) THEN
          ALTER TABLE "notifications" DROP COLUMN IF EXISTS "user_id";
        END IF;
      END $$;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'notifications'
        ) THEN
          ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "user_id" uuid NULL;
        END IF;
      END $$;
    `);
  }
}
