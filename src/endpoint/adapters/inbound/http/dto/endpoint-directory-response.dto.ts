import { Endpoint } from '@endpoint/domain/aggregates/endpoint';

export type EndpointDirectoryResponseDto = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  endpoints: Endpoint[] | null;
  createdAt: string | null;
  updatedAt: string | null;
};
