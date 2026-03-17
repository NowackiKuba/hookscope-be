import { DomainException } from '@shared/domain/exceptions';

export class PacketNotPurchasableException extends DomainException {
  constructor() {
    super('Packet is not purchasable via Stripe', 'PACKET_NOT_PURCHASABLE');
  }
}

