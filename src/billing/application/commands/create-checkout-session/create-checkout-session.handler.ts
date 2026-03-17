import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Token } from '@billing/constants';
import type { PacketRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/packet.repository.port';
import type { StripePort } from '@billing/domain/ports/outbound/stripe/stripe.port';
import { CreateCheckoutSessionCommand } from './create-checkout-session.command';
import {
  PacketNotFoundException,
  PacketNotPurchasableException,
} from '@billing/domain/exceptions';

@CommandHandler(CreateCheckoutSessionCommand)
export class CreateCheckoutSessionHandler implements ICommandHandler<CreateCheckoutSessionCommand> {
  constructor(
    @Inject(Token.PacketRepository)
    private readonly packetRepository: PacketRepositoryPort,
    @Inject(Token.Stripe)
    private readonly stripe: StripePort,
  ) {}

  async execute(
    command: CreateCheckoutSessionCommand,
  ): Promise<{ id: string; url: string }> {
    const packet = await this.packetRepository.findById(command.packetId);
    if (!packet) {
      throw new PacketNotFoundException();
    }

    const json = packet.toJSON();
    if (!json.stripePriceId) {
      throw new PacketNotPurchasableException();
    }

    return await this.stripe.createCheckoutSession({
      priceId: json.stripePriceId,
      userId: command.userId,
      successUrl: command.successUrl,
      cancelUrl: command.cancelUrl,
    });
  }
}
