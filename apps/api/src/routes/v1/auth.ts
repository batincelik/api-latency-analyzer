import type { AppEnv } from '@ala/config';
import { AuditAction, prisma } from '@ala/db';
import { loginBodySchema, refreshBodySchema, registerBodySchema } from '@ala/shared';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

import { authenticateRequest } from '../../lib/authenticate.js';
import { writeAudit } from '../../services/audit.service.js';
import {
  loginUser,
  logoutSession,
  refreshSession,
  registerUser,
} from '../../services/auth.service.js';

const logoutBodySchema = z.object({ refreshToken: z.string().min(10) });

export const authRoutes: FastifyPluginAsync<{ env: AppEnv }> = async (app, opts) => {
  app.post('/auth/register', async (req, reply) => {
    const body = registerBodySchema.parse(req.body);
    const result = await registerUser(opts.env, body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return reply.status(201).send(result);
  });

  app.post('/auth/login', async (req, reply) => {
    const body = loginBodySchema.parse(req.body);
    const result = await loginUser(opts.env, body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return reply.send(result);
  });

  app.post('/auth/refresh', async (req, reply) => {
    const body = refreshBodySchema.parse(req.body);
    const result = await refreshSession(opts.env, body.refreshToken, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return reply.send(result);
  });

  app.post('/auth/logout', async (req, reply) => {
    const body = logoutBodySchema.parse(req.body);
    await authenticateRequest(opts.env, req, reply);
    const userId = req.userId!;
    await logoutSession(body.refreshToken, userId);
    await writeAudit({
      userId,
      action: AuditAction.USER_LOGOUT,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return reply.code(204).send();
  });

  app.get('/auth/me', async (req, reply) => {
    await authenticateRequest(opts.env, req, reply);
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    return reply.send({ user });
  });
};
