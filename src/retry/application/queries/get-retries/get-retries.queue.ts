import { GetRetriesInput } from '@retry/adapters/inbound/http/dto/get-retries';

export class GetRetriesQueue {
  constructor(public readonly payload: GetRetriesInput & { userId: string }) {}
}
