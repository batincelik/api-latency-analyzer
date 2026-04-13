import type { AuditAction, Prisma } from '@ala/db';
import { prisma } from '@ala/db';

export async function writeAudit(input: {
  userId?: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
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
