export class GetRequestByIdQuery {
  constructor(
    public readonly payload: {
      userId: string;
      requestId: string;
    },
  ) {}
}
