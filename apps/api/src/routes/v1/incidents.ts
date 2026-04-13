import type { AppEnv } from '@ala/config';
import { prisma } from '@ala/db';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticateRequest } from '../../lib/authenticate.js';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['OPEN', 'RESOLVED']).optional(),
});

export const incidentsRoutes: FastifyPluginAsync<{ env: AppEnv }> = async (app, opts) => {
  app.get('/incidents', { preHandler: (req, reply) => authenticateRequest(opts.env, req, reply) }, async (req) => {
    const userId = req.userId!;
    const q = querySchema.parse(req.query);
    return prisma.alertEvent.findMany({
      where: {
        endpoint: { userId },
        ...(q.status ? { status: q.status } : {}),
      },
      orderBy: { firedAt: 'desc' },
      take: q.limit,
      include: {
        endpoint: { select: { id: true, name: true, url: true } },
        alertRule: { select: { id: true, type: true } },
      },
    });
  });
};
