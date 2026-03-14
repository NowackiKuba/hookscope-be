export class DeleteEndpointCommand {
  constructor(
    public readonly payload: {
      userId: string;
      endpointId: string;
    },
  ) {}
}
