import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEndpointSchemaCommand } from './create-endpoint-schema.command';
import { Inject } from '@nestjs/common';
import { DEFAULT_EVENT_TYPE_KEY, Token } from '@endpoint/constants';
import { EndpointSchemaRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-schema.repository.port';
import { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { AIService } from '@shared/constants';
import { AiServicePort } from '@shared/domain/ports/outbound/ai.service.port';
import { GenerationTarget } from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';
import { EndpointNotFoundException } from '@endpoint/domain/exceptions/endpoint-not-found.exception';
import { LatestEndpointSchemaNotFoundException } from '@endpoint/domain/exceptions/latest-endpoint-schema-not-found.exception';

@CommandHandler(CreateEndpointSchemaCommand)
export class CreateEndpointSchemaHandler implements ICommandHandler<CreateEndpointSchemaCommand> {
  constructor(
    @Inject(Token.EndpointSchemaRepository)
    private readonly endpointSchemaRepository: EndpointSchemaRepositoryPort,
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
    @Inject(AIService)
    private readonly aiService: AiServicePort,
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

    const targets = command.payload.targets;

    const userPrompt = `
Generate code for this webhook payload schema:

${JSON.stringify(flattenedSchema, null, 2)}

Generate ONLY these targets: ${targets.join(', ')}

Target-specific rules:
${
  targets.includes(GenerationTarget.NESTJS_DTO)
    ? `
${GenerationTarget.NESTJS_DTO}:
- Class name: WebhookPayloadDto
- Use @IsString(), @IsNumber(), @IsBoolean(), @IsOptional(), @IsArray()
- Nested objects → separate decorated classes
- Import from class-validator
- null type → @IsOptional() + Type | null
`
    : ''
}
${
  targets.includes(GenerationTarget.ZOD_SCHEMA)
    ? `
${GenerationTarget.ZOD_SCHEMA}:
- Schema name: webhookPayloadSchema
- Export inferred type: export type WebhookPayload = z.infer<typeof webhookPayloadSchema>
- null type → .nullable().optional()
- Import from zod
`
    : ''
}
${
  targets.includes(GenerationTarget.TS_INTERFACE)
    ? `
${GenerationTarget.TS_INTERFACE}:
- Interface name: WebhookPayload
- null type → field?: Type | null
- Nested objects → separate interfaces
`
    : ''
}
${
  targets.includes(GenerationTarget.GO_STRUCT)
    ? `
${GenerationTarget.GO_STRUCT}:
- Struct name: WebhookPayload
- Use json tags: \`json:"field_name"\`
- null type → use pointer: *string, *int
- Nested objects → separate structs
`
    : ''
}
${
  targets.includes(GenerationTarget.PYTHON_DATACLASS)
    ? `
${GenerationTarget.PYTHON_DATACLASS}:
- Use @dataclass decorator
- Class name: WebhookPayload
- null type → Optional[type] = None
- Import from dataclasses and typing
- Nested objects → separate dataclasses
`
    : ''
}
${
  targets.includes(GenerationTarget.JAVA_CLASS)
    ? `
${GenerationTarget.JAVA_CLASS}:
- Use lombok @Data, @Builder, @NoArgsConstructor, @AllArgsConstructor
- Class name: WebhookPayload
- null type → use Optional<Type>
- Nested objects → separate classes
- Add @JsonProperty for camelCase mapping
`
    : ''
}
${
  targets.includes(GenerationTarget.RUST_STRUCT)
    ? `
${GenerationTarget.RUST_STRUCT}:
- Derive: #[derive(Debug, Serialize, Deserialize)]
- Struct name: WebhookPayload
- null type → Option<Type>
- Use serde rename: #[serde(rename_all = "camelCase")]
- Nested objects → separate structs
`
    : ''
}
${
  targets.includes(GenerationTarget.PRISMA_MODEL)
    ? `
${GenerationTarget.PRISMA_MODEL}:
- Model name: WebhookPayload
- Map types: string→String, number→Float, boolean→Boolean
- null type → field Type?
- Arrays → use Json type or separate model with relation
`
    : ''
}

Respond with JSON in exactly this format:
{
  ${targets.map((t) => `"${t}": "// complete code here"`).join(',\n  ')}
}
`;

    const generated = await this.aiService.generateToJSON<{
      [key: string]: string;
    }>(userPrompt, {
      schema: flattenedSchema,
      targets: targets,
    });

    const saved = await this.endpointSchemaRepository.createNextVersion({
      endpointId: command.payload.endpointId,
      schema: flattenedSchema,
      generated,
      eventType: command.payload.eventType,
    });

    return saved.id;
  }
}
