import { prisma } from '@ala/db';
import { Prisma } from '@ala/db';
import { AppError } from '../lib/app-error.js';
function windowBounds(window, from, to) {
    const end = to ?? new Date();
    if (window === 'custom') {
        if (!from || !to)
            throw AppError.validation({ window: 'custom requires from and to' });
        return { start: from, end: to };
    }
    const start = new Date(end);
    if (window === '1h')
        start.setHours(start.getHours() - 1);
    else if (window === '24h')
        start.setHours(start.getHours() - 24);
    else
        start.setDate(start.getDate() - 7);
    return { start, end };
}
export async function getEndpointMetrics(userId, endpointId, window, from, to) {
    const ep = await prisma.endpoint.findFirst({
        where: { id: endpointId, userId },
        select: { id: true, lastStatusSuccess: true, lastCheckAt: true },
    });
    if (!ep)
        throw AppError.notFound('Endpoint');
    const { start, end } = windowBounds(window, from, to);
    const agg = await prisma.$queryRaw(Prisma.sql `
    SELECT
      COUNT(*)::bigint AS total,
      SUM(CASE WHEN "success" THEN 1 ELSE 0 END)::bigint AS successes,
      SUM(CASE WHEN "success" THEN 0 ELSE 1 END)::bigint AS failures,
      AVG(CASE WHEN "success" AND "latencyMs" IS NOT NULL THEN "latencyMs"::float END) AS avg_latency,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY CASE WHEN "success" AND "latencyMs" IS NOT NULL THEN "latencyMs"::float END) AS p50,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY CASE WHEN "success" AND "latencyMs" IS NOT NULL THEN "latencyMs"::float END) AS p95,
      PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY CASE WHEN "success" AND "latencyMs" IS NOT NULL THEN "latencyMs"::float END) AS p99
    FROM "CheckResult"
    WHERE "endpointId" = ${endpointId}
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
  `);
    const row = agg[0];
    const total = Number(row?.total ?? 0n);
    const successes = Number(row?.successes ?? 0n);
    const failures = Number(row?.failures ?? 0n);
    const uptimePct = total === 0 ? null : (successes / total) * 100;
    const streaks = await computeIncidentStreak(endpointId, start, end);
    return {
        window: { preset: window, start, end },
        summary: {
            totalChecks: total,
            failedChecks: failures,
            successRatePct: total === 0 ? null : (successes / total) * 100,
            errorRatePct: total === 0 ? null : (failures / total) * 100,
            uptimePct,
            avgLatencyMs: row?.avg_latency ?? null,
            p50LatencyMs: row?.p50 ?? null,
            p95LatencyMs: row?.p95 ?? null,
            p99LatencyMs: row?.p99 ?? null,
            latestSuccess: ep.lastStatusSuccess,
            lastCheckAt: ep.lastCheckAt,
        },
        incidents: streaks,
    };
}
async function computeIncidentStreak(endpointId, start, end) {
    const checks = await prisma.checkResult.findMany({
        where: { endpointId, createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: 'asc' },
        select: { success: true },
    });
    let longest = 0;
    let cur = 0;
    for (const c of checks) {
        if (!c.success) {
            cur += 1;
            longest = Math.max(longest, cur);
        }
        else {
            cur = 0;
        }
    }
    let openFailures = 0;
    for (let i = checks.length - 1; i >= 0; i--) {
        const c = checks[i];
        if (c && !c.success)
            openFailures += 1;
        else
            break;
    }
    return { openFailures, longestFailureStreak: longest };
}
export async function listChecks(userId, endpointId, query) {
    const ep = await prisma.endpoint.findFirst({
        where: { id: endpointId, userId },
        select: { id: true },
    });
    if (!ep)
        throw AppError.notFound('Endpoint');
    const where = {
        endpointId,
        ...(query.success === undefined ? {} : { success: query.success }),
        ...(query.from || query.to
            ? {
                createdAt: {
                    ...(query.from ? { gte: query.from } : {}),
                    ...(query.to ? { lte: query.to } : {}),
                },
            }
            : {}),
    };
    const sortField = query.sort === 'latencyMs' ? 'latencyMs' : 'createdAt';
    const [total, rows] = await prisma.$transaction([
        prisma.checkResult.count({ where }),
        prisma.checkResult.findMany({
            where,
            orderBy: { [sortField]: query.order },
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
        }),
    ]);
    return { rows, total, page: query.page, pageSize: query.pageSize };
}
export async function listAlertEvents(userId, endpointId, query) {
    const ep = await prisma.endpoint.findFirst({
        where: { id: endpointId, userId },
        select: { id: true },
    });
    if (!ep)
        throw AppError.notFound('Endpoint');
    const where = {
        endpointId,
        ...(query.status ? { status: query.status } : {}),
    };
    const [total, rows] = await prisma.$transaction([
        prisma.alertEvent.count({ where }),
        prisma.alertEvent.findMany({
            where,
            orderBy: { firedAt: query.order },
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
            include: { alertRule: true },
        }),
    ]);
    return { rows, total, page: query.page, pageSize: query.pageSize };
}
//# sourceMappingURL=metrics.service.js.map