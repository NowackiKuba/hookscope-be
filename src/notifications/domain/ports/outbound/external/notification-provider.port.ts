export type NotificationProviderContext = {
  url: string;
  body: unknown;
};

export interface NotificationProviderPort {
  notify(context: NotificationProviderContext): Promise<void>;
}
