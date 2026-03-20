export class CreateUserSettingsCommand {
  constructor(
    public readonly payload: {
      userId: string;
    },
  ) {}
}
