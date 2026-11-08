
/** Number and unit formatting helpers. Defaults to Indian rupees and en-IN digit grouping (1,25,000); pass `currency` and `locale` to change. */

export const formatCurrency = (n: number, opts: { currency?: string; locale?: string; compact?: boolean; decimals?: number } = {}) => {
  const { currency = 'INR', locale = 'en-IN', compact = false, decimals } = opts;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: decimals ?? (compact ? 1 : Number.isInteger(n) ? 0 : 2),
    minimumFractionDigits: decimals,
  }).format(n);
};

/** 12400 -> "12.4K"; in en-IN, 1250000 -> "12.5L". */
export const formatCompact = (n: number, locale = 'en-IN') => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);

/** 0.1234 -> "12.3%". Pass a whole number with `whole` (12.34 -> "12.3%"). */
export const formatPercent = (n: number, whole = false, digits = 1) => `${(whole ? n : n * 100).toFixed(digits).replace(/\.0+$/, '')}%`;

/** 1536 -> "1.5 KB". */
export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let n = bytes / 1024;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 ? 1 : 0)} ${units[i]}`;
};

/** 3725 seconds -> "1h 2m". Seconds are dropped once past an hour. */
export const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h ? `${h}h ${m}m` : m ? `${m}m${s ? ` ${s}s` : ''}` : `${s}s`;
};

/** Renders an amount, tinted when `signed`: green for gains, red for losses, with an explicit + sign. */
export function Currency({ value, signed = false, className, ...opts }: { value: number; signed?: boolean; className?: string; currency?: string; locale?: string; compact?: boolean; decimals?: number }) {
  const text = formatCurrency(Math.abs(value), opts);
  const tone = signed ? (value > 0 ? 'text-success' : value < 0 ? 'text-destructive' : '') : '';
  return <span className={`tabular-nums ${tone} ${className ?? ''}`}>{signed ? (value > 0 ? '+' : value < 0 ? '−' : '') : value < 0 ? '−' : ''}{text}</span>;
}
