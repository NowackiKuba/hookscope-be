export class GetEndpointsQuery {
  constructor(
    public readonly payload: {
      userId: string;
    },
  ) {}
}
