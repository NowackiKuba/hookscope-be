import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '@auth/auth.module';
import { EndpointModule } from '@endpoint/endpoint.module';
import { RequestModule } from '@request/request.module';
import { UserSettingsModule } from '@user-settings/user-settings.module';
import { Token, WEBHOOK_PROVIDERS } from './constants';
import { WebhookVerificationService } from './adapters/outbound/persistence/services/webhook-verification.service';
import { StripeWebhookProvider } from './adapters/outbound/external/stripe-webhook.provider';
import { GitHubWebhookProvider } from './adapters/outbound/external/github-webhook.provider';
import { ShopifyWebhookProvider } from './adapters/outbound/external/shopify-webhook.provider';
import { Przelewy24WebhookProvider } from './adapters/outbound/external/przelewy24-webhook.provider';
import { IWebhookProvider } from './domain/ports/outbound/external/webhook-provider.port';
import { WebhookAlertRepository } from './adapters/outbound/persistence/repositories/webhook-alert.repository';
import { WebhookAlertMapper } from './adapters/outbound/persistence/mappers/webhook-alert.mapper';
import { CreateWebhookAlertHandler } from './application/commands/create-webhook-alert/create-webhook-alert.handler';
import { GetWebhookAlertsHandler } from './application/queries/get-webhook-alerts/get-webhook-alerts.handler';
import { GetWebhookAlertByIdHandler } from './application/queries/get-webhook-alert-by-id/get-webhook-alert-by-id.handler';
import { WebhookAlertsController } from './adapters/inbound/http/controllers/webhook-alerts.controller';
import { DomainExceptionFilter } from './adapters/inbound/http/filters/domain-exception.filter';
import { VolumeSpikeScannerCron } from './adapters/inbound/cron/volume-spike-scanner.cron';
import { AlertDetectedListener } from './application/listeners/alert-detected.listener';
import { UpdateWebhookAlertHandler } from './application/commands/update-webhook-alert/update-webhook-alert.handler';
import { ScanWebhookProcessor } from './adapters/outbound/queue/scan-webhooks/processors/scan-webhooks.queue.processor';
import { ScannerService } from './adapters/outbound/persistence/services/scanner.service';
import { DuplicateScanner } from './adapters/outbound/persistence/services/duplicate-scanner';
import { SchemaDriftScannerService } from './adapters/outbound/persistence/services/schema-drift-scanner.service';

const CommandHandlers = [CreateWebhookAlertHandler, UpdateWebhookAlertHandler];
const QueryHandlers = [GetWebhookAlertsHandler, GetWebhookAlertByIdHandler];
const EventHandlers = [AlertDetectedListener];

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    EndpointModule,
    RequestModule,
    UserSettingsModule,
    BullModule.registerQueue({
      name: 'scan-webhooks',
    }),
  ],
  controllers: [WebhookAlertsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    WebhookAlertMapper,
    DomainExceptionFilter,
    VolumeSpikeScannerCron,
    {
      provide: Token.StripeWebhookProvider,
      useClass: StripeWebhookProvider,
    },
    {
      provide: Token.GitHubWebhookProvider,
      useClass: GitHubWebhookProvider,
    },
    {
      provide: Token.ShopifyWebhookProvider,
      useClass: ShopifyWebhookProvider,
    },
    {
      provide: Token.Przelewy24WebhookProvider,
      useClass: Przelewy24WebhookProvider,
    },
    {
      provide: WEBHOOK_PROVIDERS,
      useFactory: (
        stripeProvider: IWebhookProvider,
        githubProvider: IWebhookProvider,
        shopifyProvider: IWebhookProvider,
        przelewy24Provider: IWebhookProvider,
      ): IWebhookProvider[] => [
        stripeProvider,
        githubProvider,
        shopifyProvider,
        przelewy24Provider,
      ],
      inject: [
        Token.StripeWebhookProvider,
        Token.GitHubWebhookProvider,
        Token.ShopifyWebhookProvider,
        Token.Przelewy24WebhookProvider,
      ],
    },
    WebhookVerificationService,
    {
      provide: Token.WebhookAlertRepository,
      useClass: WebhookAlertRepository,
    },
    {
      provide: Token.DuplicateScannerService,
      useClass: DuplicateScanner,
    },
    {
      provide: Token.SchemaDriftScannerService,
      useClass: SchemaDriftScannerService,
    },
    ScannerService,
    ScanWebhookProcessor,
  ],
  exports: [
    WebhookVerificationService,
    CqrsModule,
    Token.WebhookAlertRepository,
  ],
})
export class WebhookModule {}
