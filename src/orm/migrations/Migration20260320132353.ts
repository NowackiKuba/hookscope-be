import { Migration } from '@mikro-orm/migrations';

export class Migration20260320132353 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "endpoints" add column "silence_treshold" int not null default 1440;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "endpoints" drop column "silence_treshold";`);
  }

}
