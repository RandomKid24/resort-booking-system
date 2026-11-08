import * as React from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center', className)}>
      {icon && <div className="grid size-10 place-items-center rounded-full bg-secondary text-muted-foreground [&_svg]:size-5">{icon}</div>}
      <div className="grid gap-1">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mx-auto max-w-xs text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
