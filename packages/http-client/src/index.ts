import type { CheckTimings, HttpMethod } from '@ala/types';
import { Agent, fetch as undiciFetch } from 'undici';

export type MonitorRequest = {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string | null;
  timeoutMs: number;
};

export type MonitorResult =
  | {
      ok: true;
      statusCode: number;
      timings: CheckTimings;
    }
  | {
      ok: false;
      statusCode?: number;
      timings: CheckTimings;
      errorClass:
        | 'TIMEOUT'
        | 'DNS'
        | 'CONNECT'
        | 'TLS'
        | 'HTTP_STATUS'
        | 'NETWORK'
        | 'UNKNOWN';
      message: string;
    };

function classifyUndiciError(
  err: unknown,
): Pick<Extract<MonitorResult, { ok: false }>, 'errorClass' | 'message'> {
  if (err instanceof Error && err.name === 'AbortError') {
    return { errorClass: 'TIMEOUT', message: 'Request aborted (timeout)' };
  }
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (lower.includes('getaddrinfo') || lower.includes('enotfound')) {
    return { errorClass: 'DNS', message: msg };
  }
  if (lower.includes('econnrefused') || lower.includes('connect')) {
    return { errorClass: 'CONNECT', message: msg };
  }
  if (lower.includes('cert') || lower.includes('ssl') || lower.includes('tls')) {
    return { errorClass: 'TLS', message: msg };
  }
  return { errorClass: 'NETWORK', message: msg };
}

export async function executeMonitorRequest(req: MonitorRequest): Promise<MonitorResult> {
  const agent = new Agent({
    connect: { timeout: Math.min(req.timeoutMs, 60_000) },
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), req.timeoutMs);
  const started = performance.now();

  let dnsMs: number | undefined;
  let connectMs: number | undefined;
  const t0 = performance.now();

  try {
    const res = await undiciFetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.method === 'GET' ? undefined : req.body,
      dispatcher: agent,
      signal: controller.signal,
    });

    const t1 = performance.now();
    const totalMs = t1 - started;
    connectMs = Math.max(0, t0 - started);
    dnsMs = connectMs;

    await res.arrayBuffer().catch(() => undefined);

    const t2 = performance.now();
    const responseMs = t2 - t1;

    const timings: CheckTimings = {
      dnsMs,
      connectMs,
      requestMs: Math.max(0, t1 - t0),
      responseMs,
      totalMs: Math.max(totalMs, t2 - started),
    };

    return {
      ok: true,
      statusCode: res.status,
      timings,
    };
  } catch (err) {
    const totalMs = performance.now() - started;
    const classified = classifyUndiciError(err);
    return {
      ok: false,
      timings: { totalMs, dnsMs, connectMs },
      ...classified,
    };
  } finally {
    clearTimeout(timeout);
    await agent.close();
  }
}
