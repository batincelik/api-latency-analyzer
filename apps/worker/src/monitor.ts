import type { AppEnv } from '@ala/config';
import type { AlertRuleType, HttpMethod as MonitorHttpMethod } from '@ala/types';
import { CheckErrorClass, prisma, type AlertRule, type Endpoint } from '@ala/db';
import { executeMonitorRequest } from '@ala/http-client';
import { createLogger } from '@ala/logger';
import { evaluateAlertRules } from '@ala/shared';
import { Worker, type Job } from 'bullmq';
import type { Redis } from 'ioredis';
import { setTimeout as delay } from 'node:timers/promises';
import { CHECK_QUEUE, type CheckJobData } from './queues.js';
import { deliverNotifications } from './notify.js';

const log = createLogger({ name: 'worker-monitor' });

function mapHttpMethod(m: Endpoint['method']): MonitorHttpMethod {
  return m as MonitorHttpMethod;
}

function headersRecord(headers: { key: string; value: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const h of headers) {
    out[h.key] = h.value;
  }
  return out;
}

export function startMonitorWorker(
  env: AppEnv,
  connection: Redis,
): { worker: Worker<CheckJobData>; close: () => Promise<void> } {
  const worker = new Worker<CheckJobData>(
    CHECK_QUEUE,
    async (job: Job<CheckJobData>) => {
      const { endpointId, correlationId } = job.data;
      const ep = await prisma.endpoint.findFirst({
        where: { id: endpointId, archivedAt: null },
        include: { headers: true, alertRules: true },
      });
      if (!ep || !ep.enabled) {
        log.warn({ endpointId }, 'endpoint_skip');
        return;
      }

      const result = await runCheckWithRetries(env, ep, correlationId, job.id);

      await prisma.checkResult.create({
        data: {
          endpointId: ep.id,
          success: result.success,
          statusCode: result.statusCode,
          latencyMs: result.latencyMs,
          dnsMs: result.dnsMs,
          connectMs: result.connectMs,
          requestMs: result.requestMs,
          responseMs: result.responseMs,
          errorClass: result.errorClass,
          errorMessage: result.errorMessage,
          attempt: result.attempt,
          maxAttempts: result.maxAttempts,
          firstError: result.firstError,
          jobId: job.id,
          correlationId,
        },
      });

      const nextCheckAt = new Date(Date.now() + ep.intervalSeconds * 1000);
      await prisma.endpoint.update({
        where: { id: ep.id },
        data: {
          lastCheckAt: new Date(),
          lastStatusSuccess: result.success,
          nextCheckAt,
        },
      });

      await evaluateAndFireAlerts(ep, result.success, result.latencyMs, correlationId);
    },
    { connection, concurrency: env.WORKER_CONCURRENCY },
  );

  worker.on('failed', (job, err) => {
    log.error({ err, jobId: job?.id }, 'check_failed');
  });

  return {
    worker,
    close: async () => {
      await worker.close();
    },
  };
}

type InternalResult = {
  success: boolean;
  statusCode: number | null;
  latencyMs: number | null;
  dnsMs: number | null;
  connectMs: number | null;
  requestMs: number | null;
  responseMs: number | null;
  errorClass: CheckErrorClass;
  errorMessage: string | null;
  attempt: number;
  maxAttempts: number;
  firstError: string | null;
};

async function runCheckWithRetries(
  env: AppEnv,
  ep: Endpoint & { headers: { key: string; value: string }[] },
  correlationId: string,
  jobId: string | undefined,
): Promise<InternalResult> {
  const maxAttempts = env.CHECK_JOB_ATTEMPTS;
  let firstError: string | null = null;
  let last: InternalResult | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const single = await runSingleCheck(ep);
    if (!single.success && !firstError && single.errorMessage) {
      firstError = single.errorMessage;
    }
    last = {
      ...single,
      attempt,
      maxAttempts,
      firstError,
    };

    if (single.success) {
      return { ...single, attempt, maxAttempts, firstError };
    }

    const retryable =
      single.errorClass === CheckErrorClass.NETWORK ||
      single.errorClass === CheckErrorClass.DNS ||
      single.errorClass === CheckErrorClass.CONNECT ||
      single.errorClass === CheckErrorClass.TIMEOUT;

    if (!retryable || attempt === maxAttempts) {
      return { ...single, attempt, maxAttempts, firstError };
    }

    const backoff = env.CHECK_JOB_BACKOFF_MS * 2 ** (attempt - 1);
    log.warn(
      { endpointId: ep.id, correlationId, jobId, attempt, backoff },
      'check_retry_backoff',
    );
    await delay(backoff);
  }

  return last ?? {
    success: false,
    statusCode: null,
    latencyMs: null,
    dnsMs: null,
    connectMs: null,
    requestMs: null,
    responseMs: null,
    errorClass: CheckErrorClass.UNKNOWN,
    errorMessage: 'No result',
    attempt: maxAttempts,
    maxAttempts,
    firstError,
  };
}

async function runSingleCheck(
  ep: Endpoint & { headers: { key: string; value: string }[] },
): Promise<Omit<InternalResult, 'attempt' | 'maxAttempts' | 'firstError'>> {
  const res = await executeMonitorRequest({
    url: ep.url,
    method: mapHttpMethod(ep.method),
    headers: headersRecord(ep.headers),
    body: ep.body,
    timeoutMs: ep.timeoutMs,
  });

  if (!res.ok) {
    return {
      success: false,
      statusCode: res.statusCode ?? null,
      latencyMs: Math.round(res.timings.totalMs),
      dnsMs: res.timings.dnsMs != null ? Math.round(res.timings.dnsMs) : null,
      connectMs: res.timings.connectMs != null ? Math.round(res.timings.connectMs) : null,
      requestMs: res.timings.requestMs != null ? Math.round(res.timings.requestMs) : null,
      responseMs: res.timings.responseMs != null ? Math.round(res.timings.responseMs) : null,
      errorClass: mapErrorClass(res.errorClass),
      errorMessage: res.message,
    };
  }

  const expected = ep.expectedStatusCodes?.length ? ep.expectedStatusCodes : [200];
  const okStatus = expected.includes(res.statusCode);
  if (!okStatus) {
    return {
      success: false,
      statusCode: res.statusCode,
      latencyMs: Math.round(res.timings.totalMs),
      dnsMs: res.timings.dnsMs != null ? Math.round(res.timings.dnsMs) : null,
      connectMs: res.timings.connectMs != null ? Math.round(res.timings.connectMs) : null,
      requestMs: res.timings.requestMs != null ? Math.round(res.timings.requestMs) : null,
      responseMs: res.timings.responseMs != null ? Math.round(res.timings.responseMs) : null,
      errorClass: CheckErrorClass.HTTP_STATUS,
      errorMessage: `Unexpected status ${res.statusCode}`,
    };
  }

  return {
    success: true,
    statusCode: res.statusCode,
    latencyMs: Math.round(res.timings.totalMs),
    dnsMs: res.timings.dnsMs != null ? Math.round(res.timings.dnsMs) : null,
    connectMs: res.timings.connectMs != null ? Math.round(res.timings.connectMs) : null,
    requestMs: res.timings.requestMs != null ? Math.round(res.timings.requestMs) : null,
    responseMs: res.timings.responseMs != null ? Math.round(res.timings.responseMs) : null,
    errorClass: CheckErrorClass.NONE,
    errorMessage: null,
  };
}

function mapErrorClass(
  c: 'TIMEOUT' | 'DNS' | 'CONNECT' | 'TLS' | 'HTTP_STATUS' | 'NETWORK' | 'UNKNOWN',
): CheckErrorClass {
  switch (c) {
    case 'TIMEOUT':
      return CheckErrorClass.TIMEOUT;
    case 'DNS':
      return CheckErrorClass.DNS;
    case 'CONNECT':
      return CheckErrorClass.CONNECT;
    case 'TLS':
      return CheckErrorClass.TLS;
    case 'HTTP_STATUS':
      return CheckErrorClass.HTTP_STATUS;
    case 'NETWORK':
      return CheckErrorClass.NETWORK;
    default:
      return CheckErrorClass.UNKNOWN;
  }
}

async function evaluateAndFireAlerts(
  ep: Endpoint & { alertRules: AlertRule[] },
  latestSuccess: boolean,
  latestLatency: number | null,
  correlationId: string,
): Promise<void> {
  const recent = await prisma.checkResult.findMany({
    where: { endpointId: ep.id },
    orderBy: { createdAt: 'desc' },
    take: 15,
    select: { success: true, latencyMs: true },
  });

  const summaries = recent.map((r: { success: boolean; latencyMs: number | null }) => ({
    success: r.success,
    latencyMs: r.latencyMs,
  }));

  for (const rule of ep.alertRules.filter((r) => r.enabled)) {
    const evaluation = evaluateAlertRules(
      {
        type: rule.type as AlertRuleType,
        enabled: rule.enabled,
        failureThreshold: rule.failureThreshold,
        latencyThresholdMs: rule.latencyThresholdMs,
      },
      summaries,
    );

    if (!evaluation.shouldFire) {
      await resolveOpenAlert(rule.id, evaluation.dedupeKey);
      continue;
    }

    const now = new Date();
    if (rule.lastFiredAt) {
      const delta = (now.getTime() - rule.lastFiredAt.getTime()) / 1000;
      if (delta < rule.cooldownSeconds) {
        log.debug({ ruleId: rule.id, delta }, 'alert_cooldown');
        continue;
      }
    }

    if (rule.lastDedupeKey === evaluation.dedupeKey && rule.lastFiredAt) {
      const delta = (now.getTime() - rule.lastFiredAt.getTime()) / 1000;
      if (delta < rule.cooldownSeconds) continue;
    }

    const open = await prisma.alertEvent.findFirst({
      where: {
        alertRuleId: rule.id,
        status: 'OPEN',
        dedupeKey: evaluation.dedupeKey,
      },
    });
    if (open) continue;

    const event = await prisma.alertEvent.create({
      data: {
        endpointId: ep.id,
        alertRuleId: rule.id,
        status: 'OPEN',
        title: `${rule.type} on ${ep.name ?? ep.url}`,
        message: evaluation.reason ?? 'Alert fired',
        dedupeKey: evaluation.dedupeKey,
        payload: { correlationId, latestSuccess, latestLatency },
      },
    });

    await prisma.alertRule.update({
      where: { id: rule.id },
      data: { lastFiredAt: now, lastDedupeKey: evaluation.dedupeKey },
    });

    await deliverNotifications(rule, event, ep);
  }
}

async function resolveOpenAlert(alertRuleId: string, dedupeKey: string): Promise<void> {
  const open = await prisma.alertEvent.findFirst({
    where: { alertRuleId, status: 'OPEN', dedupeKey },
  });
  if (open) {
    await prisma.alertEvent.update({
      where: { id: open.id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });
  }
}
