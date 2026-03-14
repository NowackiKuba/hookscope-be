import * as winston from 'winston';
import { SeedManager } from '@mikro-orm/seeder';
import { Migrator } from '@mikro-orm/migrations';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { defineConfig } from '@mikro-orm/postgresql';
import { BaseEntity } from './entities/base.entity';
import { UserEntity } from '../users/adapters/outbound/persistence/entities/user.entity';
import { Migration20260303115404 } from './migrations/Migration20260303115404';
import { Migration20260303152430 } from './migrations/Migration20260303152430';
import { Migration20260304161413 } from './migrations/Migration20260304161413';
import { Migration20260305120000 } from './migrations/Migration20260305120000';
import { Migration20260306100000 } from './migrations/Migration20260306100000';
import { Migration20260307120000 } from './migrations/Migration20260307120000';
import { Migration20260307120001 } from './migrations/Migration20260307120001';
import { EmailOutboxEntity } from '@mailer/adapters/outbound/persistence/entities/email-outbox.entity';
import { Migration20260306150126 } from './migrations/Migration20260306150126';
import { Migration20250306120000 } from './migrations/Migration20250306120000';
import { Migration20250306130000 } from './migrations/Migration20250306130000';
import { Migration20250306140000 } from './migrations/Migration20250306140000';
import { Migration20260308222953 } from './migrations/Migration20260308222953';
import { Migration20260309191853 } from './migrations/Migration20260309191853';
import { Migration20260309193039 } from './migrations/Migration20260309193039';
import { Migration20260309200848 } from './migrations/Migration20260309200848';
import { Migration20260310093740 } from './migrations/Migration20260310093740';
import { Migration20260310120000 } from './migrations/Migration20260310120000';
import { Migration20260310130330 } from './migrations/Migration20260310130330';
import { Migration20260310140000 } from './migrations/Migration20260310140000';
import { Migration20260310150000 } from './migrations/Migration20260310150000';
import { Migration20260310162434 } from './migrations/Migration20260310162434';
import { Migration20260310180000 } from './migrations/Migration20260310180000';
import { Migration20260310190000 } from './migrations/Migration20260310190000';
import { Migration20260311175513 } from './migrations/Migration20260311175513';
import { Migration20260311190000 } from './migrations/Migration20260311190000';
import { Migration20260315120000 } from './migrations/Migration20260315120000';

// Create Winston logger instance for MikroORM
// This is used in static config before NestJS DI is available
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      const timestamp =
        typeof info.timestamp === 'string' ? info.timestamp : '';
      const level =
        typeof info.level === 'string' ? info.level.toUpperCase() : 'INFO';
      const message = typeof info.message === 'string' ? info.message : '';
      const metaStr =
        info.meta &&
        typeof info.meta === 'object' &&
        Object.keys(info.meta).length
          ? JSON.stringify(info.meta)
          : '';
      return `${timestamp} [${level}] [MikroORM] ${message} ${metaStr}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

// Logger function wrapper to match MikroORM's logger signature
// MikroORM logger expects: (message: string, context?: LogContext) => void
const mikroOrmLogger = (message: string, context?: any): void => {
  if (context) {
    logger.info(message, context);
  } else {
    logger.info(message);
  }
};

// Note: Base config - uses environment variables with defaults
export const config = defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  dbName: process.env.DB_NAME || 'app',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  debug: false,

  highlighter: new SqlHighlighter(),
  entities: [
    BaseEntity,
    UserEntity,
    EmailOutboxEntity,
  ],
  extensions: [SeedManager, Migrator],
  //

  logger: mikroOrmLogger,
  seeder: {
    glob: '!(*.d).{js,ts}',
    path: 'dist/src/orm/seeds',
    pathTs: 'src/orm/seeds',
  },
  migrations: {
    path: 'dist/src/orm/migrations',
    pathTs: 'src/orm/migrations',
    migrationsList: [
      { name: Migration20260303115404.name, class: Migration20260303115404 },
      { name: Migration20260303152430.name, class: Migration20260303152430 },
      { name: Migration20260304161413.name, class: Migration20260304161413 },
      { name: Migration20260305120000.name, class: Migration20260305120000 },
      { name: Migration20260306100000.name, class: Migration20260306100000 },
      { name: Migration20260307120000.name, class: Migration20260307120000 },
      { name: Migration20260307120001.name, class: Migration20260307120001 },
      { name: Migration20260306150126.name, class: Migration20260306150126 },
      { name: Migration20250306120000.name, class: Migration20250306120000 },
      { name: Migration20250306130000.name, class: Migration20250306130000 },
      { name: Migration20250306140000.name, class: Migration20250306140000 },
      { name: Migration20260308222953.name, class: Migration20260308222953 },
      { name: Migration20260309191853.name, class: Migration20260309191853 },
      { name: Migration20260309193039.name, class: Migration20260309193039 },
      { name: Migration20260309200848.name, class: Migration20260309200848 },
      { name: Migration20260310093740.name, class: Migration20260310093740 },
      { name: Migration20260310120000.name, class: Migration20260310120000 },
      { name: Migration20260310130330.name, class: Migration20260310130330 },
      { name: Migration20260310140000.name, class: Migration20260310140000 },
      { name: Migration20260310150000.name, class: Migration20260310150000 },
      { name: Migration20260310162434.name, class: Migration20260310162434 },
      { name: Migration20260310180000.name, class: Migration20260310180000 },
      { name: Migration20260310190000.name, class: Migration20260310190000 },
      { name: Migration20260311175513.name, class: Migration20260311175513 },
      { name: Migration20260311190000.name, class: Migration20260311190000 },
      { name: Migration20260315120000.name, class: Migration20260315120000 },
    ],
  },
});

// Note: for migration purposes
export default config;
