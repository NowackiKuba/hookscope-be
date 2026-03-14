import type { Endpoint } from './endpoint.entity';

export const ENDPOINT_REPOSITORY = Symbol('ENDPOINT_REPOSITORY');

export interface EndpointRepository {
  save(endpoint: Endpoint): Promise<void>;
  findById(id: string): Promise<Endpoint | null>;
  findByToken(token: string): Promise<Endpoint | null>;
  findAllByUserId(userId: string): Promise<Endpoint[]>;
  incrementRequestCount(id: string, lastRequestAt: Date): Promise<void>;
  delete(id: string): Promise<void>;
}
