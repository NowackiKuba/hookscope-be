import { DomainException } from '@shared/domain/exceptions';

export class PacketNotFoundException extends DomainException {
  constructor() {
    super('Packet not found', 'PACKET_NOT_FOUND');
  }
}

