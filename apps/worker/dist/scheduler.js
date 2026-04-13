import { prisma } from '@ala/db';
import { createLogger } from '@ala/logger';
import { Queue, Worker } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { CHECK_QUEUE, SCHEDULER_QUEUE } from './queues.js';
const log = createLogger({ name: 'worker-scheduler' });
export async function startScheduler(env, connection) {
    const checkQueue = new Queue(CHECK_QUEUE, { connection });
    const schedulerQueue = new Queue(SCHEDULER_QUEUE, { connection });
    await schedulerQueue.add('tick', {}, {
        repeat: { every: env.SCHEDULER_INTERVAL_MS },
        jobId: 'scheduler-tick',
        removeOnComplete: true,
    });
    const worker = new Worker(SCHEDULER_QUEUE, async () => {
        const now = new Date();
        const due = await prisma.endpoint.findMany({
            where: {
                enabled: true,
                archivedAt: null,
                OR: [{ nextCheckAt: null }, { nextCheckAt: { lte: now } }],
            },
            select: { id: true, intervalSeconds: true },
            take: 500,
        });
        for (const ep of due) {
            const lockKey = `enqueue:${ep.id}`;
            const acquired = await connection.set(lockKey, '1', 'EX', 10, 'NX');
            if (acquired !== 'OK')
                continue;
            const correlationId = randomUUID();
            await checkQueue.add('run-check', { endpointId: ep.id, correlationId }, {
                jobId: `${ep.id}:${Math.floor(Date.now() / 1000)}`,
                attempts: 1,
                removeOnComplete: { age: 3600, count: 1000 },
                removeOnFail: { age: 86_400 },
            });
        }
        log.debug({ due: due.length }, 'scheduler_tick');
    }, { connection, concurrency: 1 });
    worker.on('failed', (job, err) => {
        log.error({ err, jobId: job?.id }, 'scheduler_failed');
    });
    return async () => {
        await worker.close();
        await schedulerQueue.close();
        await checkQueue.close();
    };
}
//# sourceMappingURL=scheduler.js.map