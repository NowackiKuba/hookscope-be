import { EndpointSchemaGeneratedValue } from '@endpoint/domain/value-objects/edpoint-schema-generated.vo';

export type EndpointSchemaVersion = {
  id: string;
  endpointId: string;
  eventType: string | null;
  version: number;
  isLatest: boolean;
  schema: Record<string, string>;
  generated: EndpointSchemaGeneratedValue;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export interface EndpointSchemaRepositoryPort {
  getLatest(
    endpointId: string,
    eventType?: string | null,
  ): Promise<EndpointSchemaVersion | null>;
  createNextVersion(params: {
    endpointId: string;
    eventType?: string | null;
    schema: Record<string, string>;
    generated?: EndpointSchemaGeneratedValue;
  }): Promise<EndpointSchemaVersion>;
  getByEndpointId(
    endpointId: string,
    eventType?: string | null,
  ): Promise<EndpointSchemaVersion[]>;
}
