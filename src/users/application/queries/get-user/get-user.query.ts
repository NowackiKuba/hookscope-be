export class GetUserQuery {
  constructor(
    public readonly payload: {
      userId: string;
    },
  ) {}
}
