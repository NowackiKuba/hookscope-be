import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { BillingController } from './adapters/inbound/http/controllers/billing.controller';
import { StripeWebhookController } from './adapters/inbound/http/controllers/stripe-webhook.controller';
import { Token } from './constants';
import { PacketRepository } from './adapters/outbound/persistence/repositories/packet.repository';
import { SubscriptionRepository } from './adapters/outbound/persistence/repositories/subscription.repository';
import { PacketMapper } from './adapters/outbound/persistence/mappers/packet.mapper';
import { SubscriptionMapper } from './adapters/outbound/persistence/mappers/subscription.mapper';
import { GetPacketsHandler } from './application/queries/get-packets/get-packets.handler';
import { GetMySubscriptionHandler } from './application/queries/get-my-subscription/get-my-subscription.handler';
import { AuthModule } from '@auth/auth.module';
import { StripeService } from './infrastructure/stripe/stripe.service';
import { CreateCheckoutSessionHandler } from './application/commands/create-checkout-session/create-checkout-session.handler';
import { HandleStripeWebhookHandler } from './application/commands/handle-stripe-webhook/handle-stripe-webhook.handler';
import { CreateBillingSessionHandler } from './application/commands/create-billing-session/create-billing-session.handler';

@Module({
  imports: [CqrsModule, ConfigModule, AuthModule],
  controllers: [BillingController, StripeWebhookController],
  providers: [
    GetPacketsHandler,
    GetMySubscriptionHandler,
    CreateCheckoutSessionHandler,
    HandleStripeWebhookHandler,
    PacketMapper,
    CreateBillingSessionHandler,
    SubscriptionMapper,
    {
      provide: Token.Stripe,
      useClass: StripeService,
    },
    {
      provide: Token.PacketRepository,
      useClass: PacketRepository,
    },
    {
      provide: Token.SubscriptionRepository,
      useClass: SubscriptionRepository,
    },
  ],
  exports: [CqrsModule, Token.PacketRepository, Token.SubscriptionRepository],
})
export class BillingModule {}
