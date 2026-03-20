export class UpdateWebhookAlertCommand {
  constructor(
    public readonly payload: {
      status?: string;
      scannerStatus?: string;
      id: string;
      userId: string;
    },
  ) {}
}
