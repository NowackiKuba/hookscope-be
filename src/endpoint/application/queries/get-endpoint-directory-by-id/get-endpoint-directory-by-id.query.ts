export class GetEndpointDirectoryByIdQuery {
  constructor(
    public readonly payload: {
      userId: string;
      directoryId: string;
    },
  ) {}
}
