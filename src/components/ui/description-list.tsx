import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DescriptionItem {
  label: string;
  value: React.ReactNode;
  /** Span the full row, for long text. */
  wide?: boolean;
}

/**
 * Label and value pairs for a details panel (customer, order, employee). `columns` is 1 to 3 on wide screens;
 * `bordered` puts a divider between rows.
 */
export function DescriptionList({ items, columns = 2, bordered, className }: { items: DescriptionItem[]; columns?: 1 | 2 | 3; bordered?: boolean; className?: string }) {
  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3' }[columns];
  return (
    <dl className={cn('grid gap-x-6', cols, bordered ? 'gap-y-0' : 'gap-y-4', className)}>
      {items.map((it) => (
        <div key={it.label} className={cn('grid gap-0.5', bordered && 'border-b py-3 last:border-b-0', it.wide && 'sm:col-span-full')}>
          <dt className="text-xs font-medium text-muted-foreground">{it.label}</dt>
          <dd className="text-sm">{it.value ?? '-'}</dd>
        </div>
      ))}
    </dl>
  );
}
