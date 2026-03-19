export const WEBHOOK_PROVIDERS = Symbol('WEBHOOK_PROVIDERS');

export const Token = {
  StripeWebhookProvider: Symbol('StripeWebhookProvider'),
  GitHubWebhookProvider: Symbol('GitHubWebhookProvider'),
  ShopifyWebhookProvider: Symbol('ShopifyWebhookProvider'),
  Przelewy24WebhookProvider: Symbol('Przelewy24WebhookProvider'),
  WebhookAlertRepository: Symbol('WebhookAlertRepository'),
  DuplicateScannerService: Symbol('DuplicateScannerService'),
  SchemaDriftScannerService: Symbol('SchemaDriftScannerService'),
} as const;
