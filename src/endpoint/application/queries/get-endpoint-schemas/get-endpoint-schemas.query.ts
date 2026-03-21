import { GetEndpointSchemasInput } from '@endpoint/adapters/inbound/http/dto/get-endpoint-schemas';

export class GetEndpointSchemasQuery {
  constructor(
    public readonly payload: GetEndpointSchemasInput & {
      endpointId: string;
      userId: string;
    },
  ) {}
}
