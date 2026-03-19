import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '@auth/auth.module';
import { EndpointModule } from '@endpoint/endpoint.module';
import { RequestModule } from '@request/request.module';
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

const CommandHandlers = [CreateWebhookAlertHandler];
const QueryHandlers = [GetWebhookAlertsHandler, GetWebhookAlertByIdHandler];

@Module({
  imports: [CqrsModule, AuthModule, EndpointModule, RequestModule],
  controllers: [WebhookAlertsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
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
  ],
  exports: [
    WebhookVerificationService,
    CqrsModule,
    Token.WebhookAlertRepository,
  ],
})
export class WebhookModule {}
