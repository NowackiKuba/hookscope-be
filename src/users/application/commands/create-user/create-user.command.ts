export class CreateUserCommand {
  constructor(
    public readonly payload: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string; // hashed password
    },
  ) {}
}
