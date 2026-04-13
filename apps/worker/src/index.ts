import { loadEnv } from '@ala/config';
import { prisma } from '@ala/db';
import { createLogger } from '@ala/logger';
import { Redis } from 'ioredis';
import { startMonitorWorker } from './monitor.js';
import { startRetentionWorker } from './retention.js';
import { startScheduler } from './scheduler.js';

const log = createLogger({ name: 'worker' });
const env = loadEnv();
const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

async function main(): Promise<void> {
  const stopScheduler = await startScheduler(env, connection);
  const monitor = startMonitorWorker(env, connection);
  const stopRetention = await startRetentionWorker(env, connection);

  log.info('worker_started');

  const shutdown = async (signal: string) => {
    log.info({ signal }, 'shutdown_begin');
    await stopScheduler();
    await stopRetention();
    await monitor.worker.close();
    await connection.quit().catch(() => undefined);
    await prisma.$disconnect();
    log.info('shutdown_complete');
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  log.error({ err }, 'worker_fatal');
  process.exit(1);
});
