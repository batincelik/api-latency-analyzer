'use client';

import { Shell } from '@/components/shell';
import { getTokens } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { access } = getTokens();
    if (!access) router.replace('/login');
    else setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading session…
      </div>
    );
  }

  return <Shell>{children}</Shell>;
}
