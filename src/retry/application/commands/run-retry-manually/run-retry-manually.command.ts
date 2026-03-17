export class RunRetryManuallyCommand {
  constructor(
    public readonly retryId: string,
    public readonly userId: string,
    public readonly body?: unknown,
    public readonly headers?: Record<string, string>,
  ) {}
}
