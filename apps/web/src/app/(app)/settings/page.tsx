'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError, apiFetch } from '@/lib/api';
import { clearTokens, getTokens } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const me = await apiFetch<{ user: { email: string } }>('/api/v1/auth/me');
        setEmail(me.user.email);
      } catch {
        toast.error('Unable to load profile');
      }
    })();
  }, []);

  async function logout() {
    const { refresh } = getTokens();
    if (!refresh) {
      clearTokens();
      router.push('/login');
      return;
    }
    try {
      await apiFetch('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: refresh }),
      });
    } catch (e) {
      if (e instanceof ApiError) toast.error(e.body.message);
    } finally {
      clearTokens();
      router.push('/login');
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Session and account basics.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            <div className="font-medium">{email ?? '…'}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => void logout()}>
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
