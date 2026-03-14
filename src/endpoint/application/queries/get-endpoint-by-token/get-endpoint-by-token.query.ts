export class GetEndpointByTokenQuery {
  constructor(
    public readonly payload: {
      token: string;
    },
  ) {}
}
