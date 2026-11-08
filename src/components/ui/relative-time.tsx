'use client';

import * as React from 'react';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];

export function relative(date: Date, now = Date.now(), locale?: string) {
  const diff = (date.getTime() - now) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, secs] of UNITS) if (Math.abs(diff) >= secs || unit === 'second') return rtf.format(Math.round(diff / secs), unit);
  return '';
}

/** "3 minutes ago", live. Hover for the full date. Refreshes every 10 seconds, or every minute once it is older than an hour. */
export function RelativeTime({ date, className }: { date: Date | string | number; className?: string }) {
  const d = React.useMemo(() => new Date(date), [date]);
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), Math.abs(Date.now() - d.getTime()) < 3600000 ? 10000 : 60000);
    return () => clearInterval(id);
  }, [d]);
  return <time dateTime={d.toISOString()} title={d.toLocaleString()} className={className}>{relative(d, now)}</time>;
}
