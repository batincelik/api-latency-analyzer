import { prisma } from '@ala/db';
export async function writeAudit(input) {
    await prisma.auditLog.create({
        data: {
            userId: input.userId ?? undefined,
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId,
            metadata: input.metadata,
            ip: input.ip ?? undefined,
            userAgent: input.userAgent ?? undefined,
        },
    });
}
//# sourceMappingURL=audit.service.js.map