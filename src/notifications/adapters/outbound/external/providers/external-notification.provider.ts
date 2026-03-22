import { Inject, Injectable } from '@nestjs/common';
import {
  NotificationProviderContext,
  NotificationProviderPort,
} from '@notifications/domain/ports/outbound/external/notification-provider.port';
import { HttpClientProvider } from '@shared/constants';
import { HttpClientPort } from '@shared/domain/ports/outbound/http.client.port';

@Injectable()
export class ExternalNotificationProvider implements NotificationProviderPort {
  constructor(
    @Inject(HttpClientProvider)
    private readonly httpClient: HttpClientPort,
  ) {}

  async notify(context: NotificationProviderContext): Promise<void> {
    const res = await this.httpClient.post(context.url, context.body, {
      'Content-Type': 'application/json',
    });
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`Webhook POST failed: HTTP ${res.status} ${res.body}`);
    }
  }
}
