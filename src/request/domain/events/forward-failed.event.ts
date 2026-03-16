export class ForwardFailedEvent {
  constructor(
    public readonly requestId: string,
    public readonly endpointId: string,
    public readonly targetUrl: string,
    public readonly error: string,
  ) {}
}
