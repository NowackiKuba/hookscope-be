import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { WebhookAlertEntity } from '../entities/webhook-alert.entity';
import { WebhookAlert } from '@webhook/domain/aggreagates/webhook-alert';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';
import { EndpointEntity } from '@endpoint/adapters/outbound/persistence/entities/endpoint.entity';

@Injectable()
export class WebhookAlertMapper {
  constructor(private readonly em: EntityManager) {}

  toDomain(entity: WebhookAlertEntity): WebhookAlert {
    return WebhookAlert.create({
      ...entity,
      endpointId: entity.endpoint.id,
      userId: entity.user.id,
    });
  }

  toEntity(domain: WebhookAlert): WebhookAlertEntity {
    const domainJSON = domain.toJSON();

    return new WebhookAlertEntity({
      ...domainJSON,
      user: this.em.getReference(UserEntity, domainJSON.userId),
      endpoint: this.em.getReference(EndpointEntity, domainJSON.endpointId),
    });
  }
}
