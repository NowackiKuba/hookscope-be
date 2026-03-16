import { z } from 'zod';
import { ConfigService as NestConfigService } from '@nestjs/config';

// App configuration (optional with defaults)
const AppConfigSchema = z.object({
  ENV: z.enum(['development', 'production']).default('production'),
  PORT: z.coerce.number().default(8080),
  ORIGIN: z.string().default('http://localhost:3000'),
  /** Base URL of the API (e.g. for webhook URLs). Defaults to http://localhost:PORT */
  APP_URL: z.string().default('http://localhost:8080'),
});

//

// Clerk authentication configuration (required)
const ClerkConfigSchema = z.object({
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_WEBHOOK_SECRET: z.string(),
});

// Database configuration (required)
const DatabaseConfigSchema = z.object({
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('app'),
  DB_USER: z.string().default('user'),
  DB_PASSWORD: z.string().default('password'),
});

// BullMQ job configuration (optional with defaults)
const BullMQJobConfigSchema = z.object({
  JOB_ATTEMPTS: z.coerce.number().default(3),
  JOB_BACKOFF_DELAY_MS: z.coerce.number().default(2000),
  JOB_REMOVE_ON_COMPLETE_AGE_SECONDS: z.coerce.number().default(24 * 3600), // 24 hours
  JOB_REMOVE_ON_COMPLETE_COUNT: z.coerce.number().default(1000),
  JOB_REMOVE_ON_FAIL_AGE_SECONDS: z.coerce.number().default(7 * 24 * 3600), // 7 days
});

// Anthropic Claude (optional – required for document AI chat)
const AnthropicConfigSchema = z.object({
  ANTHROPIC_API_KEY: z.string().optional(),
});

const InvoicesConfigSchema = z.object({
  INFAKT_API_KEY: z
    .string()
    .optional()
    .transform((v) =>
      v === '' || (typeof v === 'string' && !v.trim()) ? undefined : v,
    ),
  INFAKT_BASE_URL: z
    .string()
    .url()
    .optional()
    .default('https://api.infakt.pl/api/v3'),
  INFAKT_SANDBOX: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

// Mailer (Resend) configuration – optional; mailer will no-op if not configured
const MailerConfigSchema = z.object({
  RESEND_API_KEY: z.string().optional().default(''),
  MAIL_FROM: z.string().optional().default('noreply@hookscope.com'),
});

// Stripe configuration (optional; required for billing and webhooks)
const StripeConfigSchema = z.object({
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

// UploadThing file storage (optional; required for file uploads)
const UploadThingConfigSchema = z.object({
  UPLOADTHING_TOKEN: z.string().optional(),
});

// Geo IP / location (optional; default uses ipwho.is, free for commercial use)
const GeoConfigSchema = z.object({
  GEO_API_BASE_URL: z
    .string()
    .url()
    .optional()
    .default('https://ipwho.is'),
  /** When IP is private/local (e.g. localhost, Docker), use this country code so geo still works. E.g. "PL" for Poland. */
  DEFAULT_COUNTRY_CODE: z.string().length(2).optional(),
});

// Merge all configuration schemas
export const BASE_CONFIG = AppConfigSchema.merge(ClerkConfigSchema)
  .merge(DatabaseConfigSchema)
  .merge(BullMQJobConfigSchema)
  .merge(AnthropicConfigSchema)
  .merge(InvoicesConfigSchema)
  .merge(MailerConfigSchema)
  .merge(StripeConfigSchema)
  .merge(UploadThingConfigSchema)
  .merge(GeoConfigSchema);

/**
 * Type automatically inferred from BASE_CONFIG schema.
 * This ensures type safety and single source of truth.
 */
export type Config = z.infer<typeof BASE_CONFIG>;

export type ConfigService = NestConfigService<Config, true>;

export const validateConfig = (config: Record<string, unknown>) => {
  return BASE_CONFIG.parse(config);
};
