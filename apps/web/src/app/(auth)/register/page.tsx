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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<{ accessToken: string; refreshToken: string }>(
        '/api/v1/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({ email, password, name: name || undefined }),
        },
      );
      setTokens(res.accessToken, res.refreshToken);
      toast.success('Account created');
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.body.message);
      else toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <p className="text-sm text-muted-foreground">12+ character password required.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Name (optional)</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Password</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                minLength={12}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link className="text-primary hover:underline" href="/login">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
