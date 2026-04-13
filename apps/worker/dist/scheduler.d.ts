import type { AppEnv } from '@ala/config';
import type { Redis } from 'ioredis';
export declare function startScheduler(env: AppEnv, connection: Redis): Promise<() => Promise<void>>;
//# sourceMappingURL=scheduler.d.ts.map