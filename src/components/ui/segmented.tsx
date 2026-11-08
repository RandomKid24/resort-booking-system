'use client';

import * as React from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export function Segmented<T extends string>({
  value,
  onValueChange,
  options,
  className,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v as T)}
      className={cn('inline-flex gap-0.5 rounded-lg bg-secondary p-0.5', className)}
    >
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-muted-foreground outline-none transition-[color,background-color,border-color,box-shadow,transform,opacity] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm [&_svg]:size-3.5"
        >
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
