export class ResetPasswordCommand {
  constructor(
    public readonly payload: { token: string; newPassword: string },
  ) {}
}
