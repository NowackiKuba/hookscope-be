export class RequestForwardedEvent {
  constructor(
    public readonly requestId: string,
    public readonly endpointId: string,
    public readonly forwardStatus: number,
    public readonly forwardError: string | null,
  ) {}
}
