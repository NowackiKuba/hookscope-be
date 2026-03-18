export class GetUserCLITokenQuery {
  constructor(
    public readonly payload: {
      userId: string;
    },
  ) {}
}
