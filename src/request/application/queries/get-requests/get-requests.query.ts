export class GetRequestsQuery {
  constructor(
    public readonly payload: {
      userId: string;
      endpointId: string;
      limit: number;
      offset: number;
    },
  ) {}
}
