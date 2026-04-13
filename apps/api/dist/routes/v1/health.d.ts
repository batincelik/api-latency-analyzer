import type { AppEnv } from '@ala/config';
import type { FastifyPluginAsync } from 'fastify';
import type { Redis as RedisClient } from 'ioredis';
export declare const healthRoutes: FastifyPluginAsync<{
    env: AppEnv;
    redis: RedisClient;
}>;
//# sourceMappingURL=health.d.ts.map