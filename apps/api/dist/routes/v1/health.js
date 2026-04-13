import { prisma } from '@ala/db';
export const healthRoutes = async (app, opts) => {
    app.get('/health', async () => ({
        status: 'ok',
        service: 'api',
        env: opts.env.NODE_ENV,
    }));
    app.get('/live', async () => ({ status: 'alive' }));
    app.get('/ready', async (req, reply) => {
        try {
            await prisma.$queryRaw `SELECT 1`;
            await opts.redis.ping();
            return { status: 'ready', db: true, redis: true };
        }
        catch (err) {
            req.log.error({ err }, 'readiness_failed');
            return reply.status(503).send({ status: 'not_ready' });
        }
    });
};
//# sourceMappingURL=health.js.map