import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Token as BillingToken } from '@billing/constants';
import type { SubscriptionRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/subscription.repository.port';
import type { PacketRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/packet.repository.port';
import { packetToLimits } from '@billing/application/utils/packet-limits';
import {
  BooleanFeatureKey,
  FEATURE_KEY,
} from '../decorators/require-feature.decorator';

type AuthenticatedRequest = Request & { user?: { userId: string } };

@Injectable()
export class FeatureAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(BillingToken.SubscriptionRepository)
    private readonly subscriptions: SubscriptionRepositoryPort,
    @Inject(BillingToken.PacketRepository)
    private readonly packets: PacketRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<
      BooleanFeatureKey | undefined
    >(FEATURE_KEY, [context.getHandler(), context.getClass()]);

    // No feature requirement on this route — allow through
    if (!requiredFeature) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = req.user?.userId;

    // Unauthenticated requests are handled by JwtAuthGuard upstream
    if (!userId) return true;

    const subscription = await this.subscriptions.findByUserId(userId);
    const packet = subscription
      ? await this.packets.findById(subscription.toJSON().packetId)
      : await this.packets.findByCode('free');

    if (!packet) {
      throw new ForbiddenException('No active plan found');
    }

    const limits = packetToLimits(packet);

    if (!limits[requiredFeature]) {
      throw new ForbiddenException(
        `Your current plan does not include access to this feature`,
      );
    }

    return true;
  }
}
