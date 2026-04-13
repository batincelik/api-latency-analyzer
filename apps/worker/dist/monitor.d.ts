import type { AppEnv } from '@ala/config';
import { Worker } from 'bullmq';
import type { Redis } from 'ioredis';
import { type CheckJobData } from './queues.js';
export declare function startMonitorWorker(env: AppEnv, connection: Redis): {
    worker: Worker<CheckJobData>;
    close: () => Promise<void>;
};
//# sourceMappingURL=monitor.d.ts.map