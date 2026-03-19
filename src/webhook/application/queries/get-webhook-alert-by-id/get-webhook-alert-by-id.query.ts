export class GetWebhookAlertByIdQuery {
  constructor(
    public readonly payload: { userId: string; alertId: string },
  ) {}
}
