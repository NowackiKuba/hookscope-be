import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { Token as BillingToken } from '@billing/constants';
import type { SubscriptionRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/subscription.repository.port';
import type { PacketRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/packet.repository.port';
import { packetToLimits } from '@billing/application/utils/packet-limits';
import { Token as EndpointToken } from '@endpoint/constants';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';

type AuthenticatedRequest = Request & { user?: { userId: string } };

@Injectable()
export class SubscriptionLimitsGuard implements CanActivate {
  constructor(
    @Inject(BillingToken.SubscriptionRepository)
    private readonly subscriptions: SubscriptionRepositoryPort,
    @Inject(BillingToken.PacketRepository)
    private readonly packets: PacketRepositoryPort,
    @Inject(EndpointToken.EndpointRepository)
    private readonly endpoints: EndpointRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = req.user?.userId;
    if (!userId) return true;

    const subscription = await this.subscriptions.findByUserId(userId);
    const packet = subscription
      ? await this.packets.findById(subscription.toJSON().packetId)
      : await this.packets.findByCode('free');

    if (!packet) return true;
    const limits = packetToLimits(packet);

    // Enforce endpoint limit when creating endpoints (null = unlimited)
    if (limits.endpoints != null) {
      const count = await this.endpoints.countByUserId(userId);
      if (count >= limits.endpoints) {
        throw new HttpException('Endpoint limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
    }

    return true;
  }
}

