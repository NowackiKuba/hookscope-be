export class UpdateEndpointDirectoryCommand {
  constructor(
    public readonly payload: {
      userId: string;
      directoryId: string;
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
    },
  ) {}
}
