import type { EndpointDirectoryFilters } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-directory.repository.port';

export class GetEndpointDirectoriesByUserIdQuery {
  constructor(
    public readonly payload: {
      userId: string;
      filters?: EndpointDirectoryFilters;
    },
  ) {}
}
