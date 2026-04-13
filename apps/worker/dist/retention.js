import { prisma } from '@ala/db';
import { createLogger } from '@ala/logger';
import { Queue, Worker } from 'bullmq';
const log = createLogger({ name: 'worker-retention' });
const RETENTION_QUEUE = 'retention-cleanup';
export async function startRetentionWorker(env, connection) {
    const queue = new Queue(RETENTION_QUEUE, { connection });
    await queue.add('cleanup', {}, {
        repeat: { every: 86_400_000 },
        jobId: 'retention-cleanup',
        removeOnComplete: true,
    });
    const worker = new Worker(RETENTION_QUEUE, async () => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - env.METRICS_RETENTION_DAYS);
        const res = await prisma.checkResult.deleteMany({
            where: { createdAt: { lt: cutoff } },
        });
        log.info({ deleted: res.count, cutoff }, 'retention_cleanup');
    }, { connection, concurrency: 1 });
    return async () => {
        await worker.close();
        await queue.close();
    };
}
//# sourceMappingURL=retention.js.map