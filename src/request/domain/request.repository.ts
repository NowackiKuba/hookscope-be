import type { Request } from './request.entity';

export const REQUEST_REPOSITORY = Symbol('REQUEST_REPOSITORY');

export interface RequestRepository {
  save(request: Request): Promise<void>;
  findById(id: string): Promise<Request | null>;
  findByEndpointId(
    endpointId: string,
    limit: number,
    offset: number,
  ): Promise<Request[]>;
  countByEndpointId(endpointId: string): Promise<number>;
  countThisMonth(endpointId: string): Promise<number>;
  updateForwardResult(
    id: string,
    result: {
      forwardStatus: number | null;
      forwardedAt: Date;
      forwardError: string | null;
    },
  ): Promise<void>;
  delete(id: string): Promise<void>;
  deleteOlderThan(endpointId: string, date: Date): Promise<void>;
}
