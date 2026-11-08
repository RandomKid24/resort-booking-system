import * as React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

const field =
  'w-full rounded-md border border-input bg-background px-3 text-sm shadow-[0_1px_1px_rgb(0_0_0/0.02)] outline-none transition-[border,box-shadow] placeholder:text-muted-foreground hover:border-muted-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 read-only:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/15';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  /** Shows a spinner in the right slot and sets aria-busy. Typing stays possible. */
  loading?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightSlot: slot, loading, type = 'text', ...props }, ref) => {
    const rightSlot = slot ?? (loading ? <Spinner className="size-4" /> : undefined);
    if (loading) props['aria-busy'] = true;
    if (!leftIcon && !rightSlot) {
      return <input ref={ref} type={type} className={cn(field, 'h-(--control-h)', className)} {...props} />;
    }
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 text-muted-foreground [&_svg]:size-4">{leftIcon}</span>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(field, 'h-(--control-h)', leftIcon && 'pl-9', rightSlot && 'pr-12', className)}
          {...props}
        />
        {rightSlot && <span className="absolute right-2 flex items-center">{rightSlot}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(field, 'min-h-20 py-2 leading-relaxed', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';
