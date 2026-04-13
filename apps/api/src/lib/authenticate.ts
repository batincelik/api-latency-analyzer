import type { AppEnv } from '@ala/config';
import { prisma } from '@ala/db';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './app-error.js';
import { verifyAccessToken } from './auth-tokens.js';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    sessionId?: string;
  }
}

export async function authenticateRequest(
  env: AppEnv,
  req: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw AppError.unauthorized('Missing bearer token');
  const token = header.slice('Bearer '.length).trim();
  try {
    const { userId, sessionId } = await verifyAccessToken(env, token);
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!session) throw AppError.unauthorized('Session invalid or revoked');
    req.userId = userId;
    req.sessionId = sessionId;
  } catch {
    throw AppError.unauthorized('Invalid access token');
  }
}
