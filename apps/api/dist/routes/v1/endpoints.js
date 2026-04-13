import { createEndpointBodySchema, listAlertsQuerySchema, listChecksQuerySchema, listEndpointsQuerySchema, metricsQuerySchema, updateEndpointBodySchema, } from '@ala/shared';
import { authenticateRequest } from '../../lib/authenticate.js';
import { createEndpoint, getEndpoint, listEndpoints, softDeleteEndpoint, updateEndpoint, } from '../../services/endpoint.service.js';
import { getEndpointMetrics, listAlertEvents, listChecks, } from '../../services/metrics.service.js';
export const endpointsRoutes = async (app, opts) => {
    const guard = (req, reply) => authenticateRequest(opts.env, req, reply);
    app.post('/endpoints', { preHandler: guard }, async (req, reply) => {
        const userId = req.userId;
        const body = createEndpointBodySchema.parse(req.body);
        const created = await createEndpoint(userId, body, {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return reply.status(201).send(created);
    });
    app.get('/endpoints', { preHandler: guard }, async (req) => {
        const userId = req.userId;
        const q = listEndpointsQuerySchema.parse(req.query);
        const result = await listEndpoints(userId, {
            page: q.page,
            pageSize: q.pageSize,
            sort: q.sort,
            order: q.order,
            enabled: q.enabled,
            tag: q.tag,
            q: q.q,
            includeArchived: q.includeArchived,
        });
        return {
            data: result.rows.map((r) => ({
                id: r.id,
                name: r.name,
                url: r.url,
                method: r.method,
                enabled: r.enabled,
                archivedAt: r.archivedAt,
                tags: r.tags,
                intervalSeconds: r.intervalSeconds,
                lastCheckAt: r.lastCheckAt,
                lastStatusSuccess: r.lastStatusSuccess,
                checksCount: r._count.checkResults,
                createdAt: r.createdAt,
            })),
            meta: {
                page: result.page,
                pageSize: result.pageSize,
                total: result.total,
                sort: result.sort,
            },
        };
    });
    app.get('/endpoints/:id', { preHandler: guard }, async (req) => {
        const userId = req.userId;
        const id = req.params.id;
        return getEndpoint(userId, id);
    });
    app.patch('/endpoints/:id', { preHandler: guard }, async (req) => {
        const userId = req.userId;
        const id = req.params.id;
        const body = updateEndpointBodySchema.parse(req.body);
        return updateEndpoint(userId, id, body, {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
    });
    app.delete('/endpoints/:id', { preHandler: guard }, async (req, reply) => {
        const userId = req.userId;
        const id = req.params.id;
        await softDeleteEndpoint(userId, id, {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return reply.status(204).send();
    });
    app.get('/endpoints/:id/metrics', { preHandler: guard }, async (req) => {
        const userId = req.userId;
        const id = req.params.id;
        const q = metricsQuerySchema.parse(req.query);
        return getEndpointMetrics(userId, id, q.window, q.from, q.to);
    });
    app.get('/endpoints/:id/checks', { preHandler: guard }, async (req) => {
        const userId = req.userId;
        const id = req.params.id;
        const q = listChecksQuerySchema.parse(req.query);
        const result = await listChecks(userId, id, {
            page: q.page,
            pageSize: q.pageSize,
            order: q.order,
            success: q.success,
            from: q.from,
            to: q.to,
            sort: q.sort,
        });
        return {
            data: result.rows,
            meta: {
                page: result.page,
                pageSize: result.pageSize,
                total: result.total,
            },
        };
    });
    app.get('/endpoints/:id/alerts', { preHandler: guard }, async (req) => {
        const userId = req.userId;
        const id = req.params.id;
        const q = listAlertsQuerySchema.parse(req.query);
        const result = await listAlertEvents(userId, id, {
            page: q.page,
            pageSize: q.pageSize,
            order: q.order,
            status: q.status,
        });
        return {
            data: result.rows,
            meta: {
                page: result.page,
                pageSize: result.pageSize,
                total: result.total,
            },
        };
    });
};
//# sourceMappingURL=endpoints.js.map