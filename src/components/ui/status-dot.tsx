import * as React from 'react';
import { cn } from '@/lib/utils';

const tones = { success: 'bg-success', warning: 'bg-warning', danger: 'bg-destructive', info: 'bg-info', neutral: 'bg-muted-foreground' };

/** Small status light. `pulse` adds a ping ring for live states. Pass children to get a label next to it. */
export function StatusDot({ tone = 'success', pulse, children, className }: { tone?: keyof typeof tones; pulse?: boolean; children?: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[13px]', className)}>
      <span className="relative flex size-2">
        {pulse && <span className={cn('absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:hidden', tones[tone])} />}
        <span className={cn('relative size-2 rounded-full', tones[tone])} />
      </span>
      {children}
    </span>
  );
}
