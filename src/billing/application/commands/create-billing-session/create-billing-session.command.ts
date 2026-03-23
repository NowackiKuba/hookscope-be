export class CreateBillingSessionCommand {
  constructor(
    public readonly payload: {
      userId: string;
    },
  ) {}
}
