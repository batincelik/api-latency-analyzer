import type { AppEnv } from '@ala/config';
import { prisma } from '@ala/db';
import type { FastifyPluginAsync } from 'fastify';
import type { Redis as RedisClient } from 'ioredis';

export const healthRoutes: FastifyPluginAsync<{ env: AppEnv; redis: RedisClient }> = async (
  app,
  opts,
) => {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'api',
    env: opts.env.NODE_ENV,
  }));

  app.get('/live', async () => ({ status: 'alive' }));

  app.get('/ready', async (req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await opts.redis.ping();
      return { status: 'ready', db: true, redis: true };
    } catch (err) {
      req.log.error({ err }, 'readiness_failed');
      return reply.status(503).send({ status: 'not_ready' });
    }
  });
};
