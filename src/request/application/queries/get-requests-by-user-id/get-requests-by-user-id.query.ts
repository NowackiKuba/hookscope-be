import { GetRequestsByUserIdInput } from '@request/adapters/inbound/http/dto/get-requests-by-user-id';

export class GetRequestsByUserIdQuery {
  constructor(
    public readonly payload: GetRequestsByUserIdInput & { userId: string },
  ) {}
}
