export class RequestReceivedEvent {
  constructor(
    public readonly requestId: string,
    public readonly endpointId: string,
    public readonly overlimit: boolean,
    public readonly targetUrl: string | null,
    public readonly rawBody: string | null,
  ) {}
}
