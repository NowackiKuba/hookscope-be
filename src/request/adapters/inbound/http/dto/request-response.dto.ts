export type RequestResponseDto = {
  id: string;
  endpointId: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  query: Record<string, string>;
  ip: string | null;
  contentType: string | null;
  size: number;
  overlimit: boolean;
  forwardStatus: number | null;
  forwardedAt: string | null;
  forwardError: string | null;
  receivedAt: string;
};
