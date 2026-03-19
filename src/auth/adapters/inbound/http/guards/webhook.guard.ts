import { Token } from '@endpoint/constants';
import { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { decryptSecret } from '@shared/utils/encryption';
import { WebhookVerificationService } from '@webhook/adapters/outbound/persistence/services/webhook-verification.service';
import type { Request as ExpressRequest } from 'express';

type WebhookRequest = ExpressRequest & { rawBody?: Buffer };

function headersToRecord(
  headers: ExpressRequest['headers'],
): Record<string, string> {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined && value !== null) {
      out[key] = Array.isArray(value) ? value.join(', ') : String(value);
    }
  }

  return out;
}

@Injectable()
export class WebhookGuard implements CanActivate {
  constructor(
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    private readonly webhookVerificationService: WebhookVerificationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<WebhookRequest>();

    const { token } = request.params;

    const endpoint = await this.endpointRepository.findByToken(token);

    if (!endpoint) {
      throw new UnauthorizedException('Invalid webhook token');
    }

    if (!endpoint.secretKey) {
      return true;
    }

    const rawBody = request.rawBody;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      throw new BadRequestException('Missing raw webhook payload');
    }

    let decryptedSecret: string;
    try {
      decryptedSecret = decryptSecret(endpoint.secretKey);
    } catch {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    const verified = this.webhookVerificationService.verify(
      endpoint.provider.value,
      rawBody,
      headersToRecord(request.headers),
      decryptedSecret,
    );

    if (!verified) {
      throw new UnauthorizedException('Webhook signature verification failed');
    }

    return true;
  }
}
