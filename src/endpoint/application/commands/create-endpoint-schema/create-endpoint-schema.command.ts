export class CreateEndpointSchemaCommand {
  constructor(
    public readonly payload: {
      endpointId: string;
      eventType?: string;
      schema: Record<string, unknown>;
    },
  ) {}
}
