import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const variants = cva('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      ok: 'bg-ok/15 text-ok',
      warn: 'bg-warn/15 text-warn',
      bad: 'bg-bad/15 text-bad',
      muted: 'bg-muted text-foreground',
    },
  },
  defaultVariants: { variant: 'muted' },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(variants({ variant }), className)} {...props} />;
}
