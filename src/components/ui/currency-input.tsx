'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Money field. Shows grouped digits (1,25,000 for en-IN) while you type and gives you a plain number through `onValueChange`. */
export function CurrencyInput({
  value,
  onValueChange,
  currency = '₹',
  locale = 'en-IN',
  placeholder = '0',
  className,
  ...props
}: Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> & {
  value: number | null;
  onValueChange: (v: number | null) => void;
  currency?: string;
  locale?: string;
}) {
  const fmt = (n: number | null) => (n == null ? '' : n.toLocaleString(locale, { maximumFractionDigits: 2 }));
  const [text, setText] = React.useState(fmt(value));
  const focused = React.useRef(false);
  React.useEffect(() => { if (!focused.current) setText(fmt(value)); }, [value, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const change = (raw: string) => {
    const clean = raw.replace(/[^\d.]/g, '').replace(/(\..*?)\./g, '$1');
    if (!clean) { setText(''); return onValueChange(null); }
    const [int, dec] = clean.split('.');
    const grouped = Number(int).toLocaleString(locale);
    setText(dec !== undefined ? `${grouped}.${dec.slice(0, 2)}` : grouped);
    onValueChange(Number(clean.slice(0, int.length + (dec !== undefined ? 3 : 0))));
  };
  return (
    <div className={cn('relative flex items-center', className)}>
      <span className="pointer-events-none absolute start-3 text-sm text-muted-foreground">{currency}</span>
      <input
        {...props}
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        onFocus={() => { focused.current = true; }}
        onBlur={() => { focused.current = false; setText(fmt(value)); }}
        onChange={(e) => change(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background ps-8 pe-3 text-end text-sm tabular-nums outline-none transition-[border,box-shadow] placeholder:text-muted-foreground hover:border-muted-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 disabled:opacity-50 aria-[invalid=true]:border-destructive"
      />
    </div>
  );
}
