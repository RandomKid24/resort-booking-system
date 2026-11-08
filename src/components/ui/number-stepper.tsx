'use client';

import { MinusIcon, PlusIcon } from './icons';
import { cn } from '@/lib/utils';

/** Number field with minus and plus buttons. Holds the value inside min and max. */
export function NumberStepper({
  value,
  onValueChange,
  min = 0,
  max = 99,
  step = 1,
  className,
  invalid,
}: {
  value: number;
  onValueChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  invalid?: boolean;
}) {
  const set = (n: number) => onValueChange(Math.min(max, Math.max(min, n)));
  const btn = 'grid size-9 place-items-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-40';
  return (
    <div aria-invalid={invalid || undefined} className={cn('inline-flex items-center overflow-hidden rounded-md border bg-background aria-[invalid=true]:border-destructive', className)}>
      <button type="button" aria-label="Decrease" className={btn} disabled={value <= min} onClick={() => set(value - step)}><MinusIcon className="size-4" /></button>
      <input
        value={value}
        inputMode="numeric"
        aria-label="Value"
        onChange={(e) => { const n = parseInt(e.target.value.replace(/\D/g, ''), 10); set(Number.isNaN(n) ? min : n); }}
        onKeyDown={(e) => { if (e.key === 'ArrowUp') { e.preventDefault(); set(value + step); } if (e.key === 'ArrowDown') { e.preventDefault(); set(value - step); } }}
        className="h-9 w-12 border-x bg-transparent text-center text-sm font-medium tabular-nums outline-none focus:bg-muted"
      />
      <button type="button" aria-label="Increase" className={btn} disabled={value >= max} onClick={() => set(value + step)}><PlusIcon className="size-4" /></button>
    </div>
  );
}
