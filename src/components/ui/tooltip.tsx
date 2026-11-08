'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { InfoIcon } from './icons';
import { Kbd } from './kbd';
import { cn } from '@/lib/utils';

export const TooltipProvider = ({ delayDuration = 150, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
);

/**
 * Wrap any element: `<Tooltip content="Save"><Button/></Tooltip>`. Needs one TooltipProvider above.
 * Add `title` for a bold first line, `shortcut` for a key hint, `variant="light"` for a card look, `arrow` for a pointer.
 */
export function Tooltip({
  content,
  title,
  shortcut,
  side = 'top',
  align = 'center',
  variant = 'dark',
  arrow = false,
  className,
  children,
}: {
  content?: React.ReactNode;
  title?: React.ReactNode;
  /** Keys shown as keycaps, e.g. ['⌘', 'S']. */
  shortcut?: string[];
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  variant?: 'dark' | 'light';
  arrow?: boolean;
  className?: string;
  children: React.ReactElement;
}) {
  const light = variant === 'light';
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 max-w-64 rounded-md px-2 py-1 text-xs font-medium shadow-md animate-in',
            light ? 'border bg-popover text-popover-foreground shadow-lg' : 'bg-foreground text-background',
            (title || shortcut) && 'px-2.5 py-1.5',
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <div className="grid gap-0.5">
              {title && <span className="font-semibold">{title}</span>}
              {content && <span className={cn(title && 'font-normal opacity-80')}>{content}</span>}
            </div>
            {shortcut && (
              <span className="flex gap-0.5">
                {shortcut.map((k) => <Kbd key={k} className={cn('h-4 min-w-4 text-[10px]', !light && 'border-background/20 bg-background/15 text-background')}>{k}</Kbd>)}
              </span>
            )}
          </div>
          {arrow && <TooltipPrimitive.Arrow className={light ? 'fill-popover' : 'fill-foreground'} />}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/** Small (i) icon that explains a label or field on hover and keyboard focus. */
export function InfoTip({ content, title, side = 'top', className }: { content: React.ReactNode; title?: React.ReactNode; side?: 'top' | 'right' | 'bottom' | 'left'; className?: string }) {
  return (
    <Tooltip content={content} title={title} side={side} variant="light" arrow>
      <button type="button" aria-label="More info" className={cn('inline-grid size-5 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40', className)}>
        <InfoIcon className="size-3.5" />
      </button>
    </Tooltip>
  );
}

/** Truncates to one line and shows the full text in a tooltip, but only when it is actually cut off. Handy in table cells. */
export function TruncatedText({ children, className, side = 'top' }: { children: string; className?: string; side?: 'top' | 'right' | 'bottom' | 'left' }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [cut, setCut] = React.useState(false);
  const check = () => setCut(!!ref.current && ref.current.scrollWidth > ref.current.clientWidth);
  return (
    <TooltipPrimitive.Root open={cut ? undefined : false}>
      <TooltipPrimitive.Trigger asChild>
        <span ref={ref} onPointerEnter={check} onFocus={check} tabIndex={0} className={cn('block truncate rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50', className)}>{children}</span>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content side={side} sideOffset={6} className="z-50 max-w-72 break-words rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-md animate-in">
          {children}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
