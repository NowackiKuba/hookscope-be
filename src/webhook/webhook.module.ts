import { Module } from '@nestjs/common';
import { Token, WEBHOOK_PROVIDERS } from './constants';
import { WebhookVerificationService } from './application/services/webhook-verification.service';
import { StripeWebhookProvider } from './providers/stripe-webhook.provider';
import { GitHubWebhookProvider } from './providers/github-webhook.provider';
import { ShopifyWebhookProvider } from './providers/shopify-webhook.provider';
import { Przelewy24WebhookProvider } from './providers/przelewy24-webhook.provider';
import { IWebhookProvider } from './domain/interfaces/webhook-provider.interface';

@Module({
  providers: [
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
  ],
  exports: [WebhookVerificationService],
})
export class WebhookModule {}
