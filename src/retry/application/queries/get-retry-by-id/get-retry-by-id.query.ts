export class GetRetryByIdQuery {
  constructor(
    public readonly retryId: string,
    public readonly userId: string,
  ) {}
}
