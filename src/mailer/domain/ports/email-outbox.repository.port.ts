export type EmailOutboxEntry = {
  id: string;
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
  status: 'pending' | 'sent' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export interface EmailOutboxRepositoryPort {
  enqueue(params: {
    to: string;
    subject: string;
    template: string;
    context?: Record<string, unknown>;
    maxAttempts?: number;
  }): Promise<EmailOutboxEntry>;

  getPending(limit?: number): Promise<EmailOutboxEntry[]>;

  markSent(id: string): Promise<void>;

  markFailed(id: string, error: string): Promise<void>;
}
