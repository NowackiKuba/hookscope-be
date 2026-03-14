export class RegisterUserCommand {
  constructor(
    public readonly payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    },
  ) {}
}
