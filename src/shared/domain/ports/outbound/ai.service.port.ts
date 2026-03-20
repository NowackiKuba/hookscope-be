import { GenerationTarget } from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';

export type AiGenerationContext = {
  schema: Record<string, unknown>;
  targets: GenerationTarget[];
};

export interface AiServicePort {
  generateToJSON<T>(prompt: string, context: AiGenerationContext): Promise<T>;
}
