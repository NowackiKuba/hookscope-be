export class NewNotificationEvent {
  constructor(
    public readonly payload: {
      userId: string;
      referenceId: string;
      channel?: 'inApp' | 'email' | 'slack';
      status?: 'sent' | 'read' | 'archived' | 'failed';
      message: string;
      data?: Record<string, unknown>;
    },
  ) {}
}
//
