export class CreateCLITokenCommand {
  constructor(
    public readonly payload: {
      id: string;
      userId: string;
    },
  ) {}
}
