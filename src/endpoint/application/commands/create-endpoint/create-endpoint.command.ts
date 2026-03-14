export class CreateEndpointCommand {
  constructor(
    public readonly payload: {
      userId: string;
      name: string;
    },
  ) {}
}
