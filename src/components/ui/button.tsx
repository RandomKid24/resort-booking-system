'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderIcon } from './icons';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background,box-shadow,transform,color] duration-(--dur-fast) outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-(--press) disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
        outline: 'border bg-background hover:bg-muted hover:text-foreground',
        ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
        destructive: 'bg-destructive text-white shadow-sm hover:bg-destructive/90',
        link: 'h-auto p-0 text-primary hover:underline underline-offset-4',
        soft: 'bg-primary-soft text-primary hover:bg-primary/20',
        dark: 'bg-foreground text-background hover:bg-foreground/85',
        glow: 'bg-primary text-primary-foreground shadow-[0_0_0_0_var(--primary)] hover:shadow-[0_0_24px_2px_color-mix(in_srgb,var(--primary)_60%,transparent)] hover:-translate-y-px',
        shine: 'relative overflow-hidden bg-foreground text-background before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:transition-transform before:duration-(--dur-slow) hover:before:translate-x-full',
        brutal: 'border-2 border-foreground bg-warning text-black shadow-[3px_3px_0_0_var(--foreground)] hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_var(--foreground)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
        raised: 'border-b-4 border-primary/60 bg-primary text-primary-foreground hover:brightness-110 active:translate-y-0.5 active:border-b-2',
        outlineGlow: 'border border-primary/40 bg-transparent text-primary hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_16px_color-mix(in_srgb,var(--primary)_35%,transparent)]',
      },
      shape: { default: '', pill: 'rounded-full' },
      size: {
        xs: 'h-7 px-2.5 text-xs',
        sm: 'h-(--control-h-sm) px-3 text-[13px]',
        md: 'h-(--control-h) px-4',
        lg: 'h-(--control-h-lg) px-6 text-[15px]',
        icon: 'size-(--control-h)',
        'icon-sm': 'size-(--control-h-sm)',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', shape: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <LoaderIcon className="animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
