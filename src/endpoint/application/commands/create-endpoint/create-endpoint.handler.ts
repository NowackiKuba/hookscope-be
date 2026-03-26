import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateEndpointCommand } from './create-endpoint.command';
import { Endpoint } from '@endpoint/domain/aggregates/endpoint';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { Token } from '@endpoint/constants';
import { EndpointCreatedEvent } from '@endpoint/domain/events/endpoint-created.event';
import { encryptSecret } from '@shared/utils/encryption';
import { EndpointProviderValue } from '@endpoint/domain/value-objects/endpoint-provider.vo';

@CommandHandler(CreateEndpointCommand)
export class CreateEndpointHandler implements ICommandHandler<CreateEndpointCommand> {
  constructor(
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateEndpointCommand): Promise<string> {
    const {
      userId,
      name,
      description,
      isActive,
      targetUrl,
      token,
      secretKey,
      provider,
      silenceTreshold,
    } = command.payload;

    let encryptedSecret = null;

    if (secretKey) {
      encryptedSecret = encryptSecret(secretKey);
    }
    const endpoint = Endpoint.create({
      userId,
      name,
      description,
      provider: provider as EndpointProviderValue,
      isActive,
      targetUrl,
      token,
      silenceTreshold,
      secretKey: encryptedSecret,
      webhookUrl: `https://api.hookscope.dev/api/hooks/`,
    });
    const saved = await this.endpointRepository.save(endpoint);
    this.eventBus.publish(new EndpointCreatedEvent(saved.id, saved.userId));
    return saved.id;
  }
}
