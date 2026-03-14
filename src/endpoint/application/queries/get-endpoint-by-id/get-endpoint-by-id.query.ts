export class GetEndpointByIdQuery {
  constructor(
    public readonly payload: {
      userId: string;
      endpointId: string;
    },
  ) {}
}
