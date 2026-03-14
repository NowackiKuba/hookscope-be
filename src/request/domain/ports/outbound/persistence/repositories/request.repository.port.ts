import { Request } from '@request/domain/aggregates/request';

export interface RequestRepositoryPort {
  save(request: Request): Promise<Request>;
  findById(id: string): Promise<Request | null>;
  findByEndpointId(
    endpointId: string,
    limit: number,
    offset: number,
  ): Promise<Request[]>;
  countByEndpointId(endpointId: string): Promise<number>;
  countThisMonth(endpointId: string): Promise<number>;
  deleteOlderThan(endpointId: string, before: Date): Promise<number>;
  delete(id: string): Promise<void>;
}
