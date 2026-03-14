export class ForgotPasswordCommand {
  constructor(
    public readonly payload: {
      email: string;
    },
  ) {}
}
