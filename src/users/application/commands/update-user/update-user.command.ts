export class UpdateUserCommand {
  constructor(
    public readonly payload: {
      id: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      avatarUrl?: string;
      isActive?: boolean;
    },
  ) {}
}
