import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@auth/adapters/inbound/http/guards/auth.guard';
import { CurrentUser } from '@auth/adapters/inbound/http/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@auth/domain/ports/outbound';
import { ConfigService } from '@nestjs/config';
import type { Config } from '@config/config.schema';
import { GetPacketsQuery } from '@billing/application/queries/get-packets/get-packets.query';
import { GetMySubscriptionQuery } from '@billing/application/queries/get-my-subscription/get-my-subscription.query';
import { CreateCheckoutSessionCommand } from '@billing/application/commands/create-checkout-session/create-checkout-session.command';
import { Packet } from '@billing/domain/aggregates/packet';
import { Subscription } from '@billing/domain/aggregates/subscription';
import {
  PacketResponseDto,
  toPacketResponseDto,
} from '../dto/packet-response.dto';
import {
  SubscriptionResponseDto,
  toSubscriptionResponseDto,
} from '../dto/subscription-response.dto';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly config: ConfigService<Config, true>,
  ) {}

  @Get('packets')
  async listPackets(): Promise<PacketResponseDto[]> {
    const packets = (await this.queryBus.execute(
      new GetPacketsQuery(),
    )) as Packet[];
    return packets.map(toPacketResponseDto);
  }

  @Get('subscriptions/me')
  @UseGuards(AuthGuard)
  async getMySubscription(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SubscriptionResponseDto | null> {
    const sub = (await this.queryBus.execute(
      new GetMySubscriptionQuery(user.userId),
    )) as Subscription | null;
    return sub ? toSubscriptionResponseDto(sub) : null;
  }

  @Post('checkout-session')
  @UseGuards(AuthGuard)
  async createCheckoutSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { packetId: string; successUrl?: string; cancelUrl?: string },
  ): Promise<{ id: string; url: string }> {
    const origin = this.config.get('ORIGIN', { infer: true });
    const successUrl = body.successUrl ?? `${origin}/billing/success`;
    const cancelUrl = body.cancelUrl ?? `${origin}/billing/cancel`;

    return (await this.commandBus.execute(
      new CreateCheckoutSessionCommand(
        user.userId,
        body.packetId,
        successUrl,
        cancelUrl,
      ),
    )) as { id: string; url: string };
  }
}
