import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEndpointSchemaCommand } from './create-endpoint-schema.command';
import { Inject } from '@nestjs/common';
import { DEFAULT_EVENT_TYPE_KEY, Token } from '@endpoint/constants';
import { EndpointSchemaRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-schema.repository.port';
import { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { EndpointNotFoundException } from '@endpoint/domain/exceptions/endpoint-not-found.exception';
import { LatestEndpointSchemaNotFoundException } from '@endpoint/domain/exceptions/latest-endpoint-schema-not-found.exception';
import { EndpointSchemaCodeGenerationService } from '@endpoint/application/services/endpoint-schema-code-generation.service';

@CommandHandler(CreateEndpointSchemaCommand)
export class CreateEndpointSchemaHandler implements ICommandHandler<CreateEndpointSchemaCommand> {
  constructor(
    @Inject(Token.EndpointSchemaRepository)
    private readonly endpointSchemaRepository: EndpointSchemaRepositoryPort,
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    private readonly codeGeneration: EndpointSchemaCodeGenerationService,
  ) {}

  async execute(command: CreateEndpointSchemaCommand): Promise<string> {
    const endpoint = await this.endpointRepository.findById(
      command.payload.endpointId,
    );

    if (!endpoint) {
      throw new EndpointNotFoundException(command.payload.endpointId);
    }

    let latest = await this.endpointSchemaRepository.getLatest(
      command.payload.endpointId,
      command.payload.eventType,
    );
    if (
      !latest &&
      command.payload.eventType === DEFAULT_EVENT_TYPE_KEY
    ) {
      latest = await this.endpointSchemaRepository.getLatest(
        command.payload.endpointId,
        null,
      );
    }

    if (!latest) {
      throw new LatestEndpointSchemaNotFoundException(
        command.payload.endpointId,
        command.payload.eventType,
      );
    }

    const flattenedSchema = { ...latest.schema };

    const generated = await this.codeGeneration.generateArtifacts(
      endpoint.userId,
      flattenedSchema,
      command.payload.targets,
    );

    const saved = await this.endpointSchemaRepository.createNextVersion({
      endpointId: command.payload.endpointId,
      schema: flattenedSchema,
      generated,
      eventType: command.payload.eventType,
    });

    return saved.id;
  }
}
