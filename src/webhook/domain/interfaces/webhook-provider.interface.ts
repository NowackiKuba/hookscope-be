export interface IWebhookProvider {
  name: string;
  verify(
    payload: Buffer,
    headers: Record<string, string>,
    secret: string,
  ): boolean;
}
