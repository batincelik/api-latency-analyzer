import { createRequestId } from '../lib/request-id.js';
import fp from 'fastify-plugin';
const plugin = async (app) => {
    app.addHook('onRequest', async (req, reply) => {
        const id = req.headers['x-request-id'] ?? createRequestId();
        req.requestId = id;
        reply.header('x-request-id', id);
        req.log = req.log.child({ requestId: id });
    });
};
export default fp(plugin);
//# sourceMappingURL=request-context.js.map