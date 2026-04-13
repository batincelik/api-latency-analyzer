import type { FastifyPluginAsync } from 'fastify';
declare module 'fastify' {
    interface FastifyRequest {
        requestId: string;
    }
}
declare const _default: FastifyPluginAsync;
export default _default;
//# sourceMappingURL=request-context.d.ts.map