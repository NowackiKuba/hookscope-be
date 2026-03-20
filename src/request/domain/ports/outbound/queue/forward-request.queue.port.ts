export type JobData = {
  targetUrl: string;
  requestId: string;
  endpointId: string;
};

export interface ForwardRequestQueuePort {
  enqueue(data: JobData): Promise<void>;
}
//
