import { EndpointDirectory } from '@endpoint/domain/aggregates/endpoint-directory';
import { EndpointDirectoryId } from '@endpoint/domain/value-objects/endpoint-directory-id.vo';
import { BaseFilters } from '@shared/domain/types/base-filters.type';
import { Page } from '@shared/utils/pagination';
import { UserId } from '@users/domain/value-objects/user-id.vo';

export type EndpointDirectoryFilters = BaseFilters;

export interface EndpointDirectoryRepositoryPort {
  create(endpointDirectory: EndpointDirectory): Promise<EndpointDirectory>;
  update(endpointDirectory: EndpointDirectory): Promise<void>;
  delete(id: EndpointDirectoryId): Promise<void>;
  getById(id: EndpointDirectoryId): Promise<EndpointDirectory | null>;
  getByUserId(
    userId: UserId,
    filters: EndpointDirectoryFilters,
  ): Promise<Page<EndpointDirectory>>;
}
