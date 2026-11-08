import * as React from 'react';
import { cn } from '@/lib/utils';

/** Circular progress with the value in the middle. Pass children to replace the label, and `aria-label` to say what is progressing. */
export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  className,
  children,
  'aria-label': ariaLabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
  'aria-label'?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('relative inline-grid place-items-center text-primary', className)} style={{ width: size, height: size }} role="progressbar" aria-label={ariaLabel} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-secondary" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" stroke="currentColor" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} className="transition-[stroke-dashoffset] duration-(--dur-long) ease-[cubic-bezier(0.22,1,0.36,1)]" />
      </svg>
      <span className="absolute text-lg font-semibold tabular-nums text-foreground">{children ?? `${Math.round(v)}%`}</span>
    </div>
  );
}
