import { Inject, Injectable, Logger } from '@nestjs/common';
import { WEBHOOK_PROVIDERS } from '../../constants';
import { UnknownProviderException } from '../../domain/exceptions';
import { IWebhookProvider } from '../../domain/interfaces/webhook-provider.interface';

@Injectable()
export class WebhookVerificationService {
  private readonly logger = new Logger(WebhookVerificationService.name);

  constructor(
    @Inject(WEBHOOK_PROVIDERS)
    private readonly providers: IWebhookProvider[],
  ) {}

  /**
   * Verifies a webhook payload signature for a given provider.
   */
  verify(
    providerName: string,
    payload: Buffer,
    headers: Record<string, string>,
    secret: string,
  ): boolean {
    const provider = this.providers.find(
      (candidate) => candidate.name.toLowerCase() === providerName.toLowerCase(),
    );

    if (!provider) {
      throw new UnknownProviderException(providerName);
    }

    try {
      const isValid = provider.verify(payload, headers, secret);
      if (!isValid) {
        this.logger.warn(
          `Webhook verification failed for provider "${provider.name}"`,
        );
      }
      return isValid;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown verification error';
      this.logger.warn(
        `Webhook verification failed for provider "${provider.name}": ${errorMessage}`,
      );
      return false;
    }
  }
}
