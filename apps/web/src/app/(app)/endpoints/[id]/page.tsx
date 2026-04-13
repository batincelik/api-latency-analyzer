'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError, apiFetch } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type EndpointDetail = {
  id: string;
  name: string | null;
  url: string;
  method: string;
  enabled: boolean;
  intervalSeconds: number;
  timeoutMs: number;
  tags: string[];
  expectedStatusCodes: number[];
  lastCheckAt: string | null;
  lastStatusSuccess: boolean | null;
  headers: { key: string; value: string }[];
  alertRules: {
    id: string;
    type: string;
    enabled: boolean;
    cooldownSeconds: number;
  }[];
};

type Check = {
  id: string;
  success: boolean;
  latencyMs: number | null;
  statusCode: number | null;
  errorMessage: string | null;
  createdAt: string;
};

export default function EndpointDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [ep, setEp] = useState<EndpointDetail | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [metrics, setMetrics] = useState<{
    summary: Record<string, unknown>;
 } | null>(null);
  const [alerts, setAlerts] = useState<
    { id: string; title: string; status: string; firedAt: string; message: string }[]
  >([]);

  useEffect(() => {
    void (async () => {
      try {
        const [detail, chk, met, al] = await Promise.all([
          apiFetch<EndpointDetail>(`/api/v1/endpoints/${id}`),
          apiFetch<{ data: Check[] }>(`/api/v1/endpoints/${id}/checks?pageSize=50`),
          apiFetch(`/api/v1/endpoints/${id}/metrics?window=24h`),
          apiFetch<{ data: typeof alerts }>(`/api/v1/endpoints/${id}/alerts?pageSize=20`),
        ]);
        setEp(detail);
        setChecks(chk.data.reverse());
        setMetrics(met as { summary: Record<string, unknown> });
        setAlerts(al.data);
      } catch (e) {
        if (e instanceof ApiError) toast.error(e.body.message);
        else toast.error('Failed to load endpoint');
      }
    })();
  }, [id]);

  const chartData = useMemo(
    () =>
      checks.map((c) => ({
        t: new Date(c.createdAt).toLocaleTimeString(),
        latency: c.latencyMs ?? 0,
        ok: c.success ? 1 : 0,
      })),
    [checks],
  );

  if (!ep) {
    return <div className="text-sm text-muted-foreground">Loading monitor…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{ep.name ?? ep.url}</h1>
            {!ep.enabled ? (
              <Badge variant="muted">disabled</Badge>
            ) : ep.lastStatusSuccess ? (
              <Badge variant="ok">healthy</Badge>
            ) : ep.lastStatusSuccess === false ? (
              <Badge variant="bad">failing</Badge>
            ) : (
              <Badge variant="warn">pending</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {ep.method} · every {ep.intervalSeconds}s · timeout {ep.timeoutMs}ms
          </p>
          <p className="mt-1 max-w-3xl break-all text-xs text-muted-foreground">{ep.url}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ep.tags.map((t) => (
              <Badge key={t} variant="muted">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Uptime (24h)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {metrics?.summary?.uptimePct != null
              ? `${Number(metrics.summary.uptimePct).toFixed(2)}%`
              : '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">p95 latency</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {metrics?.summary?.p95LatencyMs != null
              ? `${Math.round(Number(metrics.summary.p95LatencyMs))} ms`
              : '—'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Checks</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {metrics?.summary?.totalChecks != null ? String(metrics.summary.totalChecks) : '—'}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latency trend</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No samples yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="t" hide />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: '#0b1220', border: '1px solid #1f2937' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#38bdf8" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent checks</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="pb-2">Time</th>
                <th className="pb-2">Result</th>
                <th className="pb-2">Latency</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {checks.slice(-15).reverse().map((c) => (
                <tr key={c.id}>
                  <td className="py-2 text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2">
                    {c.success ? <Badge variant="ok">ok</Badge> : <Badge variant="bad">fail</Badge>}
                  </td>
                  <td className="py-2">{c.latencyMs ?? '—'}</td>
                  <td className="py-2">{c.statusCode ?? '—'}</td>
                  <td className="max-w-md truncate py-2 text-xs text-muted-foreground">
                    {c.errorMessage ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alert rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {ep.alertRules.map((r) => (
              <div key={r.id} className="rounded-md border border-border p-2">
                <div className="flex justify-between">
                  <span className="font-medium">{r.type}</span>
                  <Badge variant={r.enabled ? 'ok' : 'muted'}>
                    {r.enabled ? 'on' : 'off'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Cooldown {r.cooldownSeconds}s
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alert history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {alerts.length === 0 ? (
              <p className="text-muted-foreground">No alerts yet.</p>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className="rounded-md border border-border p-2">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{a.title}</span>
                    <Badge variant={a.status === 'OPEN' ? 'bad' : 'muted'}>{a.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(a.firedAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Headers</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {ep.headers.length === 0 ? (
            'No custom headers.'
          ) : (
            <ul className="space-y-1">
              {ep.headers.map((h) => (
                <li key={h.key}>
                  <span className="font-medium text-foreground">{h.key}</span>: {h.value}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
