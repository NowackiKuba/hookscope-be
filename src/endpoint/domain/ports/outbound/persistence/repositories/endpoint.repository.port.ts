import { Endpoint } from '@endpoint/domain/aggregates/endpoint';
import { BaseFilters } from '@shared/domain/types/base-filters.type';
import { Page } from '@shared/utils/pagination';

export type EndpointFilters = BaseFilters & {
  isActive?: boolean;
  provider?: string;
};

export interface EndpointRepositoryPort {
  save(endpoint: Endpoint): Promise<Endpoint>;
  findById(id: string): Promise<Endpoint | null>;
  findByToken(token: string): Promise<Endpoint | null>;
  findAllByUserId(userId: string): Promise<Endpoint[]>;
  countByUserId(userId: string): Promise<number>;
  incrementRequestCount(id: string, lastRequestAt: Date): Promise<void>;
  getAll(filters: EndpointFilters): Promise<Page<Endpoint>>;
  delete(id: string): Promise<void>;
}
