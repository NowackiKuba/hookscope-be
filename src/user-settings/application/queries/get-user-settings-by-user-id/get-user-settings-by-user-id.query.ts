export class GetUserSettingsByUserIdQuery {
  constructor(
    public readonly payload: {
      userId: string;
    },
  ) {}
}
