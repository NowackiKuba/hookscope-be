export class CreateEndpointDirectoryCommand {
  constructor(
    public readonly payload: {
      id: string;
      name: string;
      description?: string;
      color?: string;
      icon?: string;
      userId: string;
    },
  ) {}
}
