import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    // Hidden for the first 150ms (animate-delayed-in) so quick loads never flash a spinner.
    <span role="status" aria-label="Loading" className="inline-flex animate-delayed-in">
      <span className={cn('inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)} />
    </span>
  );
}
