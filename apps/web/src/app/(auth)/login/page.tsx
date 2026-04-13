'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ApiError, apiFetch } from '@/lib/api';
import { setTokens } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<{ accessToken: string; refreshToken: string }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setTokens(res.accessToken, res.refreshToken);
      toast.success('Signed in');
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.body.message);
      else toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <p className="text-sm text-muted-foreground">
            Operational monitoring for your HTTP endpoints.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              No account?{' '}
              <Link className="text-primary hover:underline" href="/register">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
