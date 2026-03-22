import type { GenerationTarget } from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';

export class CreateEndpointSchemaCommand {
  constructor(
    public readonly payload: {
      endpointId: string;
      eventType: string;
      targets: GenerationTarget[];
    },
  ) {}
}
