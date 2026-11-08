import * as React from 'react';
import { cn } from '@/lib/utils';

export const Kbd = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <kbd
    className={cn(
      'inline-flex h-5 min-w-5 items-center justify-center rounded border border-b-2 bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground',
      className,
    )}
    {...props}
  />
);
