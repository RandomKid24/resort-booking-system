'use client';

import * as React from 'react';
import { Command as Cmdk } from 'cmdk';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { SearchIcon } from './icons';
import { cn } from '@/lib/utils';

export const Command = React.forwardRef<
  React.ElementRef<typeof Cmdk>,
  React.ComponentPropsWithoutRef<typeof Cmdk>
>(({ className, ...props }, ref) => (
  <Cmdk ref={ref} className={cn('flex w-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground', className)} {...props} />
));
Command.displayName = 'Command';

/** Modal command palette. Control `open` yourself (usually bound to Cmd/Ctrl+K). */
export function CommandDialog({
  open,
  onOpenChange,
  children,
  label = 'Command palette',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-in" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[18%] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border shadow-2xl outline-none animate-pop"
        >
          <DialogPrimitive.Title className="sr-only">{label}</DialogPrimitive.Title>
          <Command loop>{children}</Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof Cmdk.Input>,
  React.ComponentPropsWithoutRef<typeof Cmdk.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center gap-2.5 border-b px-4">
    <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
    <Cmdk.Input
      ref={ref}
      className={cn('h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground', className)}
      {...props}
    />
  </div>
));
CommandInput.displayName = 'CommandInput';

export const CommandList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Cmdk.List>) => (
  <Cmdk.List className={cn('max-h-80 overflow-y-auto p-2', className)} {...props} />
);
export const CommandEmpty = (props: React.ComponentPropsWithoutRef<typeof Cmdk.Empty>) => (
  <Cmdk.Empty className="py-10 text-center text-[13px] text-muted-foreground" {...props} />
);
export const CommandGroup = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Cmdk.Group>) => (
  <Cmdk.Group
    className={cn('[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground', className)}
    {...props}
  />
);
export const CommandItem = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Cmdk.Item>) => (
  <Cmdk.Item
    className={cn('flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-[13px] outline-none data-[selected=true]:bg-secondary [&_svg]:size-4 [&_svg]:text-muted-foreground', className)}
    {...props}
  />
);
