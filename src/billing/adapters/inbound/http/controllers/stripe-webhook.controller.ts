import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Token } from '@billing/constants';
import type { StripePort } from '@billing/domain/ports/outbound/stripe/stripe.port';
import { HandleStripeWebhookCommand } from '@billing/application/commands/handle-stripe-webhook/handle-stripe-webhook.command';
import { StripeWebhookSignatureException } from '@billing/domain/exceptions';

@Controller('billing/webhooks')
export class StripeWebhookController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(Token.Stripe)
    private readonly stripe: StripePort,
  ) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature?: string,
  ): Promise<{ received: true }> {
    if (!signature) {
      throw new StripeWebhookSignatureException();
    }

    const payload = req.rawBody;
    if (!payload) {
      throw new StripeWebhookSignatureException();
    }

    let event;
    try {
      event = this.stripe.constructWebhookEvent(payload, signature);
    } catch {
      throw new StripeWebhookSignatureException();
    }

    await this.commandBus.execute(new HandleStripeWebhookCommand(event));
    return { received: true };
  }
}

