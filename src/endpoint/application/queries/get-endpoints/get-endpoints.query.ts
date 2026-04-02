import { GetEndpointsInput } from '@endpoint/adapters/inbound/http/dto/get-endpoints';

export class GetEndpointsQuery {
  constructor(
    public readonly payload: GetEndpointsInput & {
      userId: string;
    },
  ) {}
}
