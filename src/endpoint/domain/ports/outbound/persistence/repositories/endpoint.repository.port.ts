import { Endpoint } from '@endpoint/domain/aggregates/endpoint';

export interface EndpointRepositoryPort {
  save(endpoint: Endpoint): Promise<Endpoint>;
  findById(id: string): Promise<Endpoint | null>;
  findByToken(token: string): Promise<Endpoint | null>;
  findAllByUserId(userId: string): Promise<Endpoint[]>;
  countByUserId(userId: string): Promise<number>;
  incrementRequestCount(id: string, lastRequestAt: Date): Promise<void>;
  delete(id: string): Promise<void>;
}
