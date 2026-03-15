export type CreateEndpointPayload = {
  userId: string;
  name: string;
  description?: string;
  isActive?: boolean;
  targetUrl?: string | null;
  secretKey?: string | null;
};

export class CreateEndpointCommand {
  constructor(public readonly payload: CreateEndpointPayload) {}
}
