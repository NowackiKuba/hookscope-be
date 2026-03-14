export class ReceiveRequestCommand {
  constructor(
    public readonly payload: {
      endpointId: string;
      method: string;
      headers: Record<string, string>;
      body: Record<string, unknown> | null;
      query: Record<string, string>;
      ip: string | null;
      contentType: string | null;
      size: number;
      overlimit: boolean;
    },
  ) {}
}
