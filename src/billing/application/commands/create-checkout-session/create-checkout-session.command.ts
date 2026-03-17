export class CreateCheckoutSessionCommand {
  constructor(
    public readonly userId: string,
    public readonly packetId: string,
    public readonly successUrl: string,
    public readonly cancelUrl: string,
  ) {}
}

