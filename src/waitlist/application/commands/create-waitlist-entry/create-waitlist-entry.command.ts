export class CreateWaitlistEntryCommand {
  constructor(
    public readonly payload: {
      email: string;
      source?: string;
    },
  ) {}
}
