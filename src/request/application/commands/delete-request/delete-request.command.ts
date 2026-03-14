export class DeleteRequestCommand {
  constructor(
    public readonly payload: {
      userId: string;
      requestId: string;
    },
  ) {}
}
