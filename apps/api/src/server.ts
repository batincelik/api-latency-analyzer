import { loadEnv } from '@ala/config';
import { prisma } from '@ala/db';
import { Redis } from 'ioredis';
import { buildApp } from './app.js';

const env = loadEnv();
const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2 });

async function main(): Promise<void> {
  const app = await buildApp({ env, redis });
  await app.listen({ port: env.API_PORT, host: env.API_HOST });
  app.log.info({ port: env.API_PORT }, 'api_started');

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'shutdown_begin');
    await app.close();
    await redis.quit().catch(() => undefined);
    await prisma.$disconnect();
    app.log.info('shutdown_complete');
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
