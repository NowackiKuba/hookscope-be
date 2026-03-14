export type EndpointResponseDto = {
  id: string;
  userId: string;
  name: string;
  description: string;
  token: string;
  isActive: boolean;
  targetUrl: string | null;
  requestCount: number;
  lastRequestAt: string | null;
  webhookUrl: string;
  createdAt: string;
  updatedAt: string;
};
