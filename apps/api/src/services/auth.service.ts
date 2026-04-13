import type { AppEnv } from '@ala/config';
import { AuditAction, prisma } from '@ala/db';
import type { LoginBody, RegisterBody } from '@ala/shared';
import { AppError } from '../lib/app-error.js';
import { createRefreshToken, hashRefreshToken, signAccessToken } from '../lib/auth-tokens.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { writeAudit } from './audit.service.js';

export async function registerUser(
  env: AppEnv,
  body: RegisterBody,
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<{ accessToken: string; refreshToken: string; user: { id: string; email: string } }> {
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw AppError.conflict('Email already registered');

  const passwordHash = await hashPassword(body.password, env.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash,
      name: body.name,
    },
  });

  const session = await createSession(env, user.id, meta);
  await writeAudit({
    userId: user.id,
    action: AuditAction.USER_REGISTER,
    entityType: 'User',
    entityId: user.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: { id: user.id, email: user.email },
  };
}

export async function loginUser(
  env: AppEnv,
  body: LoginBody,
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<{ accessToken: string; refreshToken: string; user: { id: string; email: string } }> {
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) throw AppError.unauthorized('Invalid credentials');
  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) throw AppError.unauthorized('Invalid credentials');

  const session = await createSession(env, user.id, meta);
  await writeAudit({
    userId: user.id,
    action: AuditAction.USER_LOGIN,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: { id: user.id, email: user.email },
  };
}

async function createSession(
  env: AppEnv,
  userId: string,
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = createRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_SECONDS * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      refreshTokenHash,
      expiresAt,
      userAgent: meta.userAgent ?? undefined,
      ip: meta.ip ?? undefined,
    },
  });

  const accessToken = await signAccessToken(env, userId, session.id);
  return { accessToken, refreshToken };
}

export async function refreshSession(
  env: AppEnv,
  refreshToken: string,
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<{ accessToken: string; refreshToken: string }> {
  const hash = hashRefreshToken(refreshToken);
  const session = await prisma.session.findFirst({
    where: {
      refreshTokenHash: hash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (!session) throw AppError.unauthorized('Invalid refresh token');

  const newRefresh = createRefreshToken();
  const newHash = hashRefreshToken(newRefresh);
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_SECONDS * 1000);

  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: newHash,
      expiresAt,
      userAgent: meta.userAgent ?? session.userAgent,
      ip: meta.ip ?? session.ip,
    },
  });

  const accessToken = await signAccessToken(env, session.userId, session.id);
  return { accessToken, refreshToken: newRefresh };
}

export async function logoutSession(refreshToken: string, userId: string): Promise<void> {
  const hash = hashRefreshToken(refreshToken);
  await prisma.session.updateMany({
    where: { refreshTokenHash: hash, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function logoutAllForUser(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
