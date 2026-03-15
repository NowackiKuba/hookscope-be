import { Request } from '@request/domain/aggregates/request';
import { BaseFilters } from '@shared/domain/types/base-filters.type';
import { Page } from '@shared/utils/pagination';
import { UserId } from '@users/domain/value-objects/user-id.vo';

export type RequestFilters = BaseFilters & {
  method?: string;
  overlimit?: boolean;
  forwardedStatus?: number;
  endpointId?: string;
};

export interface RequestRepositoryPort {
  save(request: Request): Promise<Request>;
  findById(id: string): Promise<Request | null>;
  findByEndpointId(
    filters: RequestFilters,
    endpointId: string,
  ): Promise<Page<Request>>;
  findByUserId(filters: RequestFilters, userId: UserId): Promise<Page<Request>>;
  countByEndpointId(endpointId: string): Promise<number>;
  countThisMonth(endpointId: string): Promise<number>;
  deleteOlderThan(endpointId: string, before: Date): Promise<number>;
  delete(id: string): Promise<void>;
}
