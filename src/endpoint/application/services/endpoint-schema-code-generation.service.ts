import { Inject, Injectable } from '@nestjs/common';
import { AIService } from '@shared/constants';
import { AiServicePort } from '@shared/domain/ports/outbound/ai.service.port';
import {
  GenerationTarget,
  type EndpointSchemaGeneratedValue,
} from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';
import { Token as UserSettingsToken } from '@user-settings/constants';
import type { UserSettingsRepositoryPort } from '@user-settings/domain/ports/outbound/persistence/repositories/user-settings.repository.port';
import { DEFAULT_USER_SETTINGS } from '@user-settings/domain/aggregates/user-settings';

@Injectable()
export class EndpointSchemaCodeGenerationService {
  constructor(
    @Inject(AIService)
    private readonly aiService: AiServicePort,
    @Inject(UserSettingsToken.UserSettingsRepository)
    private readonly userSettingsRepository: UserSettingsRepositoryPort,
  ) {}

  async generateArtifacts(
    userId: string,
    flattenedSchema: Record<string, string>,
    explicitTargets?: GenerationTarget[],
  ): Promise<EndpointSchemaGeneratedValue> {
    const targets = await this.resolveGenerationTargets(userId, explicitTargets);
    const userPrompt = this.buildUserPrompt(flattenedSchema, targets);
    return await this.aiService.generateToJSON<EndpointSchemaGeneratedValue>(
      userPrompt,
      {
        schema: flattenedSchema,
        targets,
      },
    );
  }

  async resolveGenerationTargets(
    userId: string,
    explicit?: GenerationTarget[],
  ): Promise<GenerationTarget[]> {
    if (explicit?.length) {
      return [...new Set(explicit)];
    }

    const settings = await this.userSettingsRepository.findByUserId(userId);
    const fromSettings = settings?.autoGenerationTargets ?? [];
    if (fromSettings.length > 0) {
      return [...new Set(fromSettings)];
    }

    return [...DEFAULT_USER_SETTINGS.autoGenerationTargets];
  }

  private buildUserPrompt(
    flattenedSchema: Record<string, string>,
    targets: GenerationTarget[],
  ): string {
    return `
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
  }
}
