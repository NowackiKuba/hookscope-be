import { EndpointSchema } from '@endpoint/domain/aggregates/endpoint-schema';
import type { EndpointSchemaGeneratedValue } from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';
import { BaseFilters } from '@shared/domain/types/base-filters.type';
import { Page } from '@shared/utils/pagination';

export type Filters = BaseFilters & {
  eventType?: string;
  isLatest?: boolean;
};

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
    filters: Filters,
    endpointId: string,
  ): Promise<Page<EndpointSchema>>;
}
