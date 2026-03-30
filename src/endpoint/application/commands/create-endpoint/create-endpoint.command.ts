export type CreateEndpointPayload = {
  userId: string;
  name: string;
  description?: string;
  silenceTreshold: number;
  directoryId?: string;
  provider: string;
  isActive?: boolean;
  targetUrl?: string | null;
  secretKey?: string | null;
  token: string;
};

export class CreateEndpointCommand {
  constructor(public readonly payload: CreateEndpointPayload) {}
}
