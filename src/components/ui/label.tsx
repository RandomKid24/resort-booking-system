'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('text-[13px] font-medium leading-none peer-disabled:opacity-50', className)}
    {...props}
  >
    {children}
    {required && <span className="ml-0.5 text-destructive">*</span>}
  </LabelPrimitive.Root>
));
Label.displayName = 'Label';

/** Label + control + hint/error, the usual form row. */
export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  // Without an explicit htmlFor the control gets a generated id, so the label is always tied to it.
  const autoId = React.useId();
  const child = React.isValidElement<{ id?: string }>(children) ? children : null;
  const controlId = htmlFor ?? child?.props.id ?? autoId;
  const control = child && !htmlFor && child.props.id === undefined ? React.cloneElement(child, { id: controlId }) : children;
  return (
    <div className={cn('grid gap-1.5', className)}>
      {label && (
        <Label htmlFor={controlId} required={required}>
          {label}
        </Label>
      )}
      {control}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
