import { type AppEnv } from '@ala/config';
import Fastify from 'fastify';
import type { Redis } from 'ioredis';
export declare function buildApp(options: {
    env?: AppEnv;
    redis: Redis;
}): Promise<Fastify.FastifyInstance<import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, Fastify.FastifyBaseLogger, Fastify.FastifyTypeProviderDefault>>;
//# sourceMappingURL=app.d.ts.map