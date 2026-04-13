import { PrismaClient } from '@prisma/client';
export type { User, Session, Endpoint, EndpointHeader, CheckResult, AlertRule, AlertEvent, AuditLog, } from '@prisma/client';
export { Prisma, PrismaClient, HttpMethod, AlertRuleType, AlertEventStatus, CheckErrorClass, AuditAction, } from '@prisma/client';
export declare function createPrismaClient(databaseUrl?: string): PrismaClient;
export declare const prisma: PrismaClient;
//# sourceMappingURL=index.d.ts.map