import { PrismaClient } from '@prisma/client';

export type {
  User,
  Session,
  Endpoint,
  EndpointHeader,
  CheckResult,
  AlertRule,
  AlertEvent,
  AuditLog,
} from '@prisma/client';
export {
  Prisma,
  PrismaClient,
  HttpMethod,
  AlertRuleType,
  AlertEventStatus,
  CheckErrorClass,
  AuditAction,
} from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function createPrismaClient(databaseUrl?: string): PrismaClient {
  return new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
