export const CHECK_QUEUE = 'endpoint-checks';
export const SCHEDULER_QUEUE = 'scheduler-tick';

export type CheckJobData = {
  endpointId: string;
  correlationId: string;
};
