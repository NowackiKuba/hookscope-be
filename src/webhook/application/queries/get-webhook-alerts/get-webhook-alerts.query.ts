export type GetWebhookAlertsQueryPayload = {
  userId: string;
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
  orderByField?: 'createdAt' | 'updatedAt' | 'type' | 'status';
  type?: string;
  status?: string;
  endpointId?: string;
};

export class GetWebhookAlertsQuery {
  constructor(public readonly payload: GetWebhookAlertsQueryPayload) {}
}
