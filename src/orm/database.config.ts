import * as winston from 'winston';
import { SeedManager } from '@mikro-orm/seeder';
import { Migrator } from '@mikro-orm/migrations';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { defineConfig } from '@mikro-orm/postgresql';
import { BaseEntity } from './entities/base.entity';
import { UserEntity } from '../users/adapters/outbound/persistence/entities/user.entity';
import { EmailOutboxEntity } from '@mailer/adapters/outbound/persistence/entities/email-outbox.entity';
import { EndpointEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint.entity';
import { RequestEntity } from '@request/adapters/outbound/persistence/entities/request.entity';
import { RetryEntity } from '@retry/adapters/outbound/persistence/entities/retry.entity';
import { WaitlistEntity } from '@waitlist/adapters/outbound/persistence/entities/waitlist.entity';
import { PacketEntity } from '@billing/adapters/outbound/persistence/entities/packet.entity';
import { SubscriptionEntity } from '@billing/adapters/outbound/persistence/entities/subscription.entity';
import { CLITokenEntity } from '@cli-token/adapters/outbound/persistence/entities/cli-token.entity';
import { Migration20260314171016 } from './migrations/Migration20260314171016';
import { Migration20260314180000 } from './migrations/Migration20260314180000';
import { Migration20260314200000 } from './migrations/Migration20260314200000';
import { Migration20260315154906 } from './migrations/Migration20260315154906';
import { Migration20260316000000 } from './migrations/Migration20260316000000';
import { Migration20260316160135 } from './migrations/Migration20260316160135';
import { Migration20260317093627 } from './migrations/Migration20260317093627';
import { Migration20260317123000 } from './migrations/Migration20260317123000';

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
    EndpointEntity,
    RequestEntity,
    RetryEntity,
    WaitlistEntity,
    PacketEntity,
    SubscriptionEntity,
    CLITokenEntity,
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
      { name: Migration20260314171016.name, class: Migration20260314171016 },
      { name: Migration20260314180000.name, class: Migration20260314180000 },
      { name: Migration20260314200000.name, class: Migration20260314200000 },
      { name: Migration20260315154906.name, class: Migration20260315154906 },
      { name: Migration20260316000000.name, class: Migration20260316000000 },
      { name: Migration20260316160135.name, class: Migration20260316160135 },
      { name: Migration20260317093627.name, class: Migration20260317093627 },
      { name: Migration20260317123000.name, class: Migration20260317123000 },
    ],
  },
});

// Note: for migration purposes
export default config;
