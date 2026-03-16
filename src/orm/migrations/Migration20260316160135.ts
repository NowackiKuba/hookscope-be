import { Migration } from '@mikro-orm/migrations';

export class Migration20260316160135 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "endpoints" add constraint "endpoints_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "endpoints" drop constraint "endpoints_user_id_foreign";`);
  }

}
