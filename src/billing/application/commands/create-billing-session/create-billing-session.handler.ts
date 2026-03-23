import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBillingSessionCommand } from './create-billing-session.command';
import { Inject } from '@nestjs/common';
import { Token } from '@billing/constants';
import type { StripePort } from '@billing/domain/ports/outbound/stripe/stripe.port';
import type { SubscriptionRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/subscription.repository.port';
import { ConfigService } from '@nestjs/config';
import type { Config } from '@config/config.schema';

@CommandHandler(CreateBillingSessionCommand)
export class CreateBillingSessionHandler implements ICommandHandler<CreateBillingSessionCommand> {
  constructor(
    @Inject(Token.Stripe)
    private readonly stripe: StripePort,
    @Inject(Token.SubscriptionRepository)
    private readonly subscriptionRepository: SubscriptionRepositoryPort,
    private readonly config: ConfigService<Config, true>,
  ) {}

  async execute(
    command: CreateBillingSessionCommand,
  ): Promise<{ id: string; url: string }> {
    const subscription = await this.subscriptionRepository.findByUserId(
      command.payload.userId,
    );
    if (!subscription) {
      throw new Error('Active subscription not found for this user');
    }

    const returnUrl = `${this.config.get('ORIGIN', { infer: true })}/usage`;
    return await this.stripe.createCustomerPortal({
      customer: subscription.toJSON().stripeCustomerId,
      return_url: returnUrl,
    });
  }
}
