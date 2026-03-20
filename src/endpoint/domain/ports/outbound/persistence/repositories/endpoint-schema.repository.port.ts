import { EndpointSchema } from '@endpoint/domain/aggregates/endpoint-schema';
import type { EndpointSchemaGeneratedValue } from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';

export interface EndpointSchemaRepositoryPort {
  getLatest(
    endpointId: string,
    eventType?: string | null,
  ): Promise<EndpointSchema | null>;
  createNextVersion(params: {
    endpointId: string;
    eventType?: string | null;
    schema: Record<string, string>;
    generated?: EndpointSchemaGeneratedValue;
  }): Promise<EndpointSchema>;
  getByEndpointId(
    endpointId: string,
    eventType?: string | null,
  ): Promise<EndpointSchema[]>;
}
