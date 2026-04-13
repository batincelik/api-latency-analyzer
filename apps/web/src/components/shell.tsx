import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/endpoints/new', label: 'New monitor' },
  { href: '/settings', label: 'Settings' },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            API Latency Analyzer
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'hover:text-foreground',
                  pathname === l.href && 'text-foreground font-medium',
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
