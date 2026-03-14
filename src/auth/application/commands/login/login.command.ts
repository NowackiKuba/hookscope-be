export class LoginCommand {
  constructor(
    public readonly payload: {
      email: string;
      password: string;
    },
  ) {}
}
