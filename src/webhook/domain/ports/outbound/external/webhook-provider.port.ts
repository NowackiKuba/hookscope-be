export interface IWebhookProvider {
  name: string;
  verify(
    payload: Buffer,
    headers: Record<string, string>,
    secret: string,
  ): boolean;
  extractEventType(
    payload: Buffer,
    headers: Record<string, string>,
  ): string | null;
}
