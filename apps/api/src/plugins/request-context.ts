import { createRequestId } from '../lib/request-id.js';
import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
  }
}

const plugin: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', async (req, reply) => {
    const id = (req.headers['x-request-id'] as string | undefined) ?? createRequestId();
    req.requestId = id;
    reply.header('x-request-id', id);
    req.log = req.log.child({ requestId: id });
  });
};

export default fp(plugin);
