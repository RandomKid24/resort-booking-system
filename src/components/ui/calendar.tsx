'use client';

import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { cn } from '@/lib/utils';

export interface DateRange {
  from?: Date;
  to?: Date;
}

type Base = {
  /** Month shown first. Defaults to the selected date, or today. */
  defaultMonth?: Date;
  /** Return true for days that cannot be picked. */
  disabled?: (date: Date) => boolean;
  /** 0 is Sunday, 1 is Monday. */
  weekStartsOn?: 0 | 1;
  /** BCP 47 tag for month and weekday names, e.g. 'de-DE' or 'ar-EG'. Defaults to 'en-US'. */
  locale?: string;
  className?: string;
};
export type CalendarProps = Base &
  (
    | { mode?: 'single'; selected?: Date; onSelect?: (date: Date | undefined) => void }
    | { mode: 'range'; selected?: DateRange; onSelect?: (range: DateRange) => void }
  );

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const isSameDay = (a?: Date, b?: Date) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;


export function Calendar(props: CalendarProps) {
  const { disabled, weekStartsOn = 0, className, defaultMonth, locale = 'en-US' } = props;
  const monthFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }), [locale]);
  const dayFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), [locale]);
  const dateNum = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const today = startOfDay(new Date());
  const range = props.mode === 'range' ? (props.selected as DateRange | undefined) : undefined;
  const single = props.mode === 'range' ? undefined : (props.selected as Date | undefined);

  const [month, setMonth] = React.useState(() => {
    const m = defaultMonth ?? single ?? range?.from ?? today;
    return new Date(m.getFullYear(), m.getMonth(), 1);
  });
  const [focused, setFocused] = React.useState<Date>(() => single ?? range?.from ?? today);
  const [hover, setHover] = React.useState<Date>();
  const gridRef = React.useRef<HTMLDivElement>(null);
  const moveFocus = React.useRef(false);

  const first = addDays(month, -((month.getDay() - weekStartsOn + 7) % 7));
  const days = Array.from({ length: 42 }, (_, i) => addDays(first, i));
  const weekdays = days.slice(0, 7).map((d) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d).slice(0, 2));

  // Keep exactly one day tabbable: the focused day if visible, otherwise the 1st.
  const tabbable = days.some((d) => isSameDay(d, focused) && d.getMonth() === month.getMonth()) ? focused : month;

  React.useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${key(focused)}"]`)?.focus();
  }, [focused, month]);

  function pick(d: Date) {
    if (disabled?.(d)) return;
    setFocused(d);
    if (props.mode === 'range') {
      const r = props.selected ?? {};
      if (!r.from || (r.from && r.to)) props.onSelect?.({ from: d, to: undefined });
      else props.onSelect?.(d < r.from ? { from: d, to: r.from } : { from: r.from, to: d });
    } else {
      props.onSelect?.(single && isSameDay(single, d) ? undefined : d);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const step: Record<string, number> = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowUp: -7, ArrowDown: 7 };
    let next: Date | undefined;
    if (e.key in step) next = addDays(focused, step[e.key]!);
    else if (e.key === 'PageUp') next = new Date(focused.getFullYear(), focused.getMonth() - 1, focused.getDate());
    else if (e.key === 'PageDown') next = new Date(focused.getFullYear(), focused.getMonth() + 1, focused.getDate());
    else if (e.key === 'Home') next = addDays(focused, -((focused.getDay() - weekStartsOn + 7) % 7));
    else if (e.key === 'End') next = addDays(focused, 6 - ((focused.getDay() - weekStartsOn + 7) % 7));
    if (!next) return;
    e.preventDefault();
    moveFocus.current = true;
    setFocused(next);
    if (next.getMonth() !== month.getMonth() || next.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  }

  const nav = 'grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40';

  // While picking the end of a range, preview the span up to the hovered day.
  const end = range?.to ?? (range?.from && hover && hover > range.from ? hover : undefined);

  return (
    <div className={cn('w-fit select-none', className)}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" className={nav} onClick={() => setMonth(addMonths(month, -1))} aria-label="Previous month">
          <ChevronLeftIcon className="size-4 rtl:rotate-180" />
        </button>
        <span className="text-[13px] font-semibold" aria-live="polite">{monthFmt.format(month)}</span>
        <button type="button" className={nav} onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month">
          <ChevronRightIcon className="size-4 rtl:rotate-180" />
        </button>
      </div>
      <div className="grid grid-cols-7">
        {weekdays.map((w, i) => (
          <span key={i} className="grid h-8 w-9 place-items-center text-[11px] font-medium text-muted-foreground">{w}</span>
        ))}
      </div>
      <div ref={gridRef} role="grid" onKeyDown={onKeyDown} onMouseLeave={() => setHover(undefined)}>
        {Array.from({ length: days.length / 7 }, (_, w) => (
          <div key={w} role="row" className="grid grid-cols-7">
            {days.slice(w * 7, w * 7 + 7).map((d) => {
              const outside = d.getMonth() !== month.getMonth();
              const isOff = disabled?.(d);
              const isStart = range ? isSameDay(d, range.from) : isSameDay(d, single);
              const isEnd = !!range && isSameDay(d, end);
              const inRange = !!range?.from && !!end && d > range.from && d < end;
              const selected = isStart || isEnd;
              return (
                <div key={key(d)} role="gridcell" className={cn('relative', inRange && 'bg-accent', isStart && end && !isSameDay(range?.from, end) && 'rounded-s-md bg-accent', isEnd && !isSameDay(range?.from, end) && 'rounded-e-md bg-accent')}>
                  <button
                    type="button"
                    data-day={key(d)}
                    tabIndex={isSameDay(d, tabbable) ? 0 : -1}
                    disabled={isOff}
                    aria-label={dayFmt.format(d)}
                    aria-pressed={selected}
                    aria-current={isSameDay(d, today) ? 'date' : undefined}
                    onClick={() => pick(d)}
                    onMouseEnter={() => setHover(d)}
                    className={cn(
                      'grid size-9 place-items-center rounded-md text-[13px] tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
                      !selected && 'hover:bg-secondary',
                      outside && !selected && !inRange && 'text-muted-foreground/40',
                      inRange && 'text-accent-foreground hover:bg-primary/10',
                      isSameDay(d, today) && !selected && 'font-semibold text-primary',
                      selected && 'bg-primary font-medium text-primary-foreground shadow-sm hover:bg-primary',
                      isOff && 'pointer-events-none opacity-30',
                    )}
                  >
                    {dateNum.format(d.getDate())}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
