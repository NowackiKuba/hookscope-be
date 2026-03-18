export class RotateCLITokenCommand {
  constructor(
    public readonly payload: {
      id: string;
      userId: string;
    },
  ) {}
}
