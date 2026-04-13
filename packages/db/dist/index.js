import { PrismaClient } from '@prisma/client';
export { Prisma, PrismaClient, HttpMethod, AlertRuleType, AlertEventStatus, CheckErrorClass, AuditAction, } from '@prisma/client';
const globalForPrisma = globalThis;
export function createPrismaClient(databaseUrl) {
    return new PrismaClient({
        datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
}
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
//# sourceMappingURL=index.js.map