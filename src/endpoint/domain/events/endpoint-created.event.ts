export class EndpointCreatedEvent {
  constructor(
    public readonly endpointId: string,
    public readonly userId: string,
  ) {}
}
