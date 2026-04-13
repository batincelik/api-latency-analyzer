'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

export default function NewEndpointPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('https://example.com');
  const [method, setMethod] = useState<(typeof methods)[number]>('GET');
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  const [timeoutMs, setTimeoutMs] = useState(10_000);
  const [headerRows, setHeaderRows] = useState<{ key: string; value: string }[]>([]);
  const [body, setBody] = useState('');
  const [expected, setExpected] = useState('200');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  function addHeaderRow() {
    setHeaderRows((r) => [...r, { key: '', value: '' }]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const parsed = await apiFetch<{ id: string }>('/api/v1/endpoints', {
        method: 'POST',
        body: JSON.stringify({
          name: name || undefined,
          url,
          method,
          intervalSeconds,
          timeoutMs,
          headers: headerRows.filter((h) => h.key),
          body: body || undefined,
          expectedStatusCodes: expected.split(',').map((s) => Number(s.trim())),
          tags: tags
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      toast.success('Monitor created');
      router.push(`/endpoints/${parsed.id}`);
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.body.message);
      else toast.error('Failed to create monitor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New monitor</h1>
        <p className="text-sm text-muted-foreground">Interval 30s–24h, timeout 500ms–120s.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Target</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-muted-foreground">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Payments API" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-muted-foreground" htmlFor="url">
                  URL
                </label>
                <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Method</label>
                <select
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as (typeof methods)[number])}
                >
                  {methods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Interval (seconds)</label>
                <Input
                  type="number"
                  min={30}
                  value={intervalSeconds}
                  onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Timeout (ms)</label>
                <Input
                  type="number"
                  min={500}
                  value={timeoutMs}
                  onChange={(e) => setTimeoutMs(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-muted-foreground">Expected status codes</label>
                <Input value={expected} onChange={(e) => setExpected(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-muted-foreground">Tags (comma separated)</label>
                <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="prod,critical" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-muted-foreground">Body (optional)</label>
                <textarea
                  className="min-h-[96px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Headers</label>
                <Button type="button" size="sm" variant="outline" onClick={addHeaderRow}>
                  Add header
                </Button>
              </div>
              <div className="space-y-2">
                {headerRows.map((h, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder="Authorization"
                      value={h.key}
                      onChange={(e) => {
                        const next = [...headerRows];
                        next[idx] = { ...next[idx], key: e.target.value };
                        setHeaderRows(next);
                      }}
                    />
                    <Input
                      placeholder="Bearer …"
                      value={h.value}
                      onChange={(e) => {
                        const next = [...headerRows];
                        next[idx] = { ...next[idx], value: e.target.value };
                        setHeaderRows(next);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Create monitor'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
