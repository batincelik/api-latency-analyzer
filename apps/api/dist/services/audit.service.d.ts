import type { AuditAction, Prisma } from '@ala/db';
export declare function writeAudit(input: {
    userId?: string | null;
    action: AuditAction;
    entityType?: string;
    entityId?: string;
    metadata?: Prisma.InputJsonValue;
    ip?: string | null;
    userAgent?: string | null;
}): Promise<void>;
//# sourceMappingURL=audit.service.d.ts.map