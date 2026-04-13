'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError, apiFetch } from '@/lib/api';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type EndpointRow = {
  id: string;
  name: string | null;
  url: string;
  method: string;
  enabled: boolean;
  lastStatusSuccess: boolean | null;
  lastCheckAt: string | null;
  tags: string[];
};

type Incident = {
  id: string;
  title: string;
  message: string;
  status: string;
  firedAt: string;
  endpoint: { id: string; name: string | null; url: string };
};

export default function DashboardPage() {
  const [endpoints, setEndpoints] = useState<EndpointRow[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filter, setFilter] = useState<'all' | 'up' | 'down'>('all');

  useEffect(() => {
    void (async () => {
      try {
        const [epRes, incRes] = await Promise.all([
          apiFetch<{ data: EndpointRow[] }>('/api/v1/endpoints?pageSize=100'),
          apiFetch<Incident[]>('/api/v1/incidents?limit=10'),
        ]);
        setEndpoints(epRes.data);
        setIncidents(incRes);
      } catch (e) {
        if (e instanceof ApiError) toast.error(e.body.message);
        else toast.error('Failed to load dashboard');
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'up') return endpoints.filter((e) => e.lastStatusSuccess === true);
    if (filter === 'down')
      return endpoints.filter((e) => e.enabled && e.lastStatusSuccess === false);
    return endpoints;
  }, [endpoints, filter]);

  const stats = useMemo(() => {
    const up = endpoints.filter((e) => e.lastStatusSuccess === true).length;
    const down = endpoints.filter((e) => e.enabled && e.lastStatusSuccess === false).length;
    return { total: endpoints.length, up, down };
  }, [endpoints]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Operations overview</h1>
          <p className="text-sm text-muted-foreground">
            Live posture across registered monitors.
          </p>
        </div>
        <Link href="/endpoints/new">
          <Button>New monitor</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Monitors</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{stats.total}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Healthy</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-ok">{stats.up}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Failing</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-bad">{stats.down}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monitors</CardTitle>
          <div className="flex gap-2 text-xs">
            {(['all', 'up', 'down'] as const).map((k) => (
              <Button
                key={k}
                size="sm"
                variant={filter === k ? 'default' : 'outline'}
                onClick={() => setFilter(k)}
              >
                {k}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="pb-2">Status</th>
                <th className="pb-2">Endpoint</th>
                <th className="pb-2">URL</th>
                <th className="pb-2">Last check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No monitors yet. Create one to start observing latency.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/40">
                    <td className="py-3">
                      {!e.enabled ? (
                        <Badge variant="muted">disabled</Badge>
                      ) : e.lastStatusSuccess == null ? (
                        <Badge variant="warn">pending</Badge>
                      ) : e.lastStatusSuccess ? (
                        <Badge variant="ok">up</Badge>
                      ) : (
                        <Badge variant="bad">down</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <Link className="font-medium hover:underline" href={`/endpoints/${e.id}`}>
                        {e.name ?? e.url}
                      </Link>
                      <div className="text-xs text-muted-foreground">{e.method}</div>
                    </td>
                    <td className="max-w-md truncate py-3 text-muted-foreground">{e.url}</td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {e.lastCheckAt ? new Date(e.lastCheckAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent incidents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No incidents in recent history.</p>
          ) : (
            incidents.map((i) => (
              <div key={i.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{i.title}</div>
                  <Badge variant={i.status === 'OPEN' ? 'bad' : 'muted'}>{i.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{i.message}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {i.endpoint.name ?? i.endpoint.url} · {new Date(i.firedAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
