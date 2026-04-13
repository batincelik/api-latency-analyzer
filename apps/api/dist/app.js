import { loadEnv } from '@ala/config';
import { createLogger } from '@ala/logger';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import Fastify from 'fastify';
import errorHandler from './plugins/error-handler.js';
import requestContext from './plugins/request-context.js';
import { authRoutes } from './routes/v1/auth.js';
import { endpointsRoutes } from './routes/v1/endpoints.js';
import { healthRoutes } from './routes/v1/health.js';
import { incidentsRoutes } from './routes/v1/incidents.js';
import { observabilityRoutes } from './routes/v1/observability.js';
export async function buildApp(options) {
    const env = options.env ?? loadEnv();
    const logger = createLogger({
        name: 'api',
        level: env.LOG_LEVEL,
        base: { otelService: env.OTEL_SERVICE_NAME },
    });
    const app = Fastify({
        logger,
        bodyLimit: parseBodyLimitBytes(env.REQUEST_BODY_LIMIT),
        requestIdHeader: 'x-request-id',
    });
    await app.register(requestContext);
    await app.register(errorHandler);
    await app.register(sensible);
    await app.register(helmet, { global: true });
    await app.register(cors, {
        origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
        credentials: true,
    });
    await app.register(rateLimit, {
        max: env.RATE_LIMIT_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW_MS,
        redis: options.redis,
        nameSpace: 'api-rate:',
    });
    await app.register(async (v1) => {
        await v1.register(healthRoutes, { prefix: '/', env, redis: options.redis });
        await v1.register(authRoutes, { env });
        await v1.register(endpointsRoutes, { env });
        await v1.register(incidentsRoutes, { env });
        await v1.register(observabilityRoutes);
    }, { prefix: '/api/v1' });
    return app;
}
function parseBodyLimitBytes(limit) {
    const m = /^(\d+)(kb|mb)?$/i.exec(limit.trim());
    if (!m)
        return 256 * 1024;
    const n = Number(m[1]);
    const unit = (m[2] ?? '').toLowerCase();
    if (unit === 'mb')
        return n * 1024 * 1024;
    return n * 1024;
}
//# sourceMappingURL=app.js.map