import type { AppEnv } from '@ala/config';
import type { FastifyReply, FastifyRequest } from 'fastify';
declare module 'fastify' {
    interface FastifyRequest {
        userId?: string;
        sessionId?: string;
    }
}
export declare function authenticateRequest(env: AppEnv, req: FastifyRequest, _reply: FastifyReply): Promise<void>;
//# sourceMappingURL=authenticate.d.ts.map