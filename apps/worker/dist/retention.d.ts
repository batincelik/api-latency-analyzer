import type { AppEnv } from '@ala/config';
import type { Redis } from 'ioredis';
export declare function startRetentionWorker(env: AppEnv, connection: Redis): Promise<() => Promise<void>>;
//# sourceMappingURL=retention.d.ts.map