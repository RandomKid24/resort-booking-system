import * as React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-[linear-gradient(90deg,var(--secondary)_25%,var(--muted)_50%,var(--secondary)_75%)] bg-[length:200%_100%] animate-shimmer',
        className,
      )}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return <Skeleton className={cn('size-10 rounded-full', className)} aria-hidden />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-3 rounded-xl border bg-card p-5', className)} aria-hidden>
      <SkeletonAvatar />
      <SkeletonText className="flex-1" />
    </div>
  );
}
