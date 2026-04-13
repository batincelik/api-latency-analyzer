import { AlertRuleType, AuditAction, HttpMethod, prisma, type Prisma } from '@ala/db';
import type { CreateEndpointBody, UpdateEndpointBody } from '@ala/shared';
import { AppError } from '../lib/app-error.js';
import { writeAudit } from './audit.service.js';

function mapMethod(m: CreateEndpointBody['method']): HttpMethod {
  return HttpMethod[m];
}

export async function createEndpoint(
  userId: string,
  body: CreateEndpointBody,
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<{ id: string }> {
  const nextCheckAt = new Date(Date.now() + body.intervalSeconds * 1000);
  const endpoint = await prisma.endpoint.create({
    data: {
      userId,
      name: body.name,
      url: body.url,
      method: mapMethod(body.method),
      timeoutMs: body.timeoutMs,
      intervalSeconds: body.intervalSeconds,
      body: body.body ?? undefined,
      expectedStatusCodes: body.expectedStatusCodes,
      enabled: body.enabled,
      tags: body.tags,
      nextCheckAt,
      headers: {
        create: body.headers.map((h) => ({ key: h.key, value: h.value })),
      },
      alertRules: body.alertRules?.length
        ? {
            create: body.alertRules.map((r) => ({
              type: r.type as AlertRuleType,
              enabled: r.enabled,
              cooldownSeconds: r.cooldownSeconds,
              failureThreshold: r.failureThreshold,
              latencyThresholdMs: r.latencyThresholdMs,
              webhookUrl: r.webhookUrl ?? undefined,
            })),
          }
        : {
            create: [
              {
                type: AlertRuleType.ENDPOINT_DOWN,
                enabled: true,
                cooldownSeconds: 300,
              },
              {
                type: AlertRuleType.REPEATED_FAILURES,
                enabled: true,
                cooldownSeconds: 300,
                failureThreshold: 3,
              },
              {
                type: AlertRuleType.LATENCY_THRESHOLD,
                enabled: false,
                cooldownSeconds: 300,
                latencyThresholdMs: 2000,
              },
            ],
          },
    },
  });

  await writeAudit({
    userId,
    action: AuditAction.ENDPOINT_CREATE,
    entityType: 'Endpoint',
    entityId: endpoint.id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return { id: endpoint.id };
}

export async function getEndpoint(userId: string, id: string) {
  const ep = await prisma.endpoint.findFirst({
    where: { id, userId },
    include: { headers: true, alertRules: true },
  });
  if (!ep) throw AppError.notFound('Endpoint');
  return ep;
}

export async function listEndpoints(
  userId: string,
  query: {
    page: number;
    pageSize: number;
    sort?: string;
    order: 'asc' | 'desc';
    enabled?: boolean;
    tag?: string;
    q?: string;
    includeArchived?: boolean;
  },
) {
  const where: Prisma.EndpointWhereInput = {
    userId,
    ...(query.includeArchived ? {} : { archivedAt: null }),
    ...(query.enabled === undefined ? {} : { enabled: query.enabled }),
    ...(query.tag ? { tags: { has: query.tag } } : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' } },
            { url: { contains: query.q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const allowedSort = new Set(['name', 'url', 'enabled', 'createdAt', 'intervalSeconds']);
  const orderField = query.sort && allowedSort.has(query.sort) ? query.sort : 'createdAt';

  const [total, rows] = await prisma.$transaction([
    prisma.endpoint.count({ where }),
    prisma.endpoint.findMany({
      where,
      orderBy: { [orderField]: query.order },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        _count: { select: { checkResults: true } },
      },
    }),
  ]);

  return { rows, total, page: query.page, pageSize: query.pageSize, sort: query.sort };
}

export async function updateEndpoint(
  userId: string,
  id: string,
  body: UpdateEndpointBody,
  meta: { ip?: string | null; userAgent?: string | null },
) {
  const existing = await prisma.endpoint.findFirst({ where: { id, userId } });
  if (!existing) throw AppError.notFound('Endpoint');

  const data: Prisma.EndpointUpdateInput = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.url !== undefined) data.url = body.url;
  if (body.method !== undefined) data.method = mapMethod(body.method);
  if (body.timeoutMs !== undefined) data.timeoutMs = body.timeoutMs;
  if (body.intervalSeconds !== undefined) data.intervalSeconds = body.intervalSeconds;
  if (body.body !== undefined) data.body = body.body ?? null;
  if (body.expectedStatusCodes !== undefined) data.expectedStatusCodes = body.expectedStatusCodes;
  if (body.enabled !== undefined) data.enabled = body.enabled;
  if (body.tags !== undefined) data.tags = body.tags;
  if (body.archived !== undefined) data.archivedAt = body.archived ? new Date() : null;

  if (body.headers) {
    await prisma.endpointHeader.deleteMany({ where: { endpointId: id } });
    await prisma.endpointHeader.createMany({
      data: body.headers.map((h) => ({ endpointId: id, key: h.key, value: h.value })),
    });
  }

  if (body.alertRules) {
    await prisma.alertRule.deleteMany({ where: { endpointId: id } });
    await prisma.alertRule.createMany({
      data: body.alertRules.map((r) => ({
        endpointId: id,
        type: r.type as AlertRuleType,
        enabled: r.enabled ?? true,
        cooldownSeconds: r.cooldownSeconds ?? 300,
        failureThreshold: r.failureThreshold,
        latencyThresholdMs: r.latencyThresholdMs,
        webhookUrl: r.webhookUrl ?? undefined,
      })),
    });
  }

  const updated = await prisma.endpoint.update({
    where: { id },
    data,
    include: { headers: true, alertRules: true },
  });

  await writeAudit({
    userId,
    action: AuditAction.ENDPOINT_UPDATE,
    entityType: 'Endpoint',
    entityId: id,
    metadata: { fields: Object.keys(body) },
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return updated;
}

export async function softDeleteEndpoint(
  userId: string,
  id: string,
  meta: { ip?: string | null; userAgent?: string | null },
) {
  const existing = await prisma.endpoint.findFirst({ where: { id, userId } });
  if (!existing) throw AppError.notFound('Endpoint');
  await prisma.endpoint.update({
    where: { id },
    data: { archivedAt: new Date(), enabled: false },
  });
  await writeAudit({
    userId,
    action: AuditAction.ENDPOINT_DELETE,
    entityType: 'Endpoint',
    entityId: id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });
}
