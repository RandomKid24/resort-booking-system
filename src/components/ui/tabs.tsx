'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

/** `underline` is flat with a bottom rule, `pill` is a contained segmented look. */
export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & { variant?: 'underline' | 'pill' }
>(({ className, variant = 'underline', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-variant={variant}
    className={cn(
      'group inline-flex items-center',
      variant === 'underline' ? 'w-full gap-5 border-b' : 'gap-0.5 rounded-lg bg-secondary p-0.5',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50 data-[state=active]:text-foreground',
      'group-data-[variant=underline]:-mb-px group-data-[variant=underline]:border-b-2 group-data-[variant=underline]:border-transparent group-data-[variant=underline]:pb-2.5 group-data-[variant=underline]:data-[state=active]:border-primary',
      'group-data-[variant=pill]:rounded-md group-data-[variant=pill]:px-3 group-data-[variant=pill]:py-1 group-data-[variant=pill]:data-[state=active]:bg-background group-data-[variant=pill]:data-[state=active]:shadow-sm',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('mt-4 outline-none animate-in', className)} {...props} />
));
TabsContent.displayName = 'TabsContent';
