'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { XIcon } from './icons';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const Overlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] animate-in', className)}
    {...props}
  />
));
Overlay.displayName = 'DialogOverlay';

const CloseButton = () => (
  <DialogPrimitive.Close className="absolute right-3.5 top-3.5 grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40">
    <XIcon className="size-4" />
    <span className="sr-only">Close</span>
  </DialogPrimitive.Close>
);

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <Overlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border bg-popover p-6 shadow-xl outline-none animate-pop',
        className,
      )}
      {...props}
    >
      {children}
      <CloseButton />
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = 'DialogContent';

const sheetVariants = cva(
  'fixed z-50 flex flex-col gap-4 bg-popover p-6 shadow-xl outline-none',
  {
    variants: {
      side: {
        right: 'inset-y-0 right-0 w-full max-w-md border-l animate-slide-right',
        left: 'inset-y-0 left-0 w-full max-w-md border-r animate-slide-left',
      },
    },
    defaultVariants: { side: 'right' },
  },
);

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & VariantProps<typeof sheetVariants>
>(({ className, side, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <Overlay />
    <DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      {children}
      <CloseButton />
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('grid gap-1 pr-6', className)} {...props} />
);
export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
);
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-base font-semibold tracking-tight', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-[13px] text-muted-foreground', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';

// A sheet is a dialog that docks to an edge.
export const Sheet = Dialog;
export const SheetTrigger = DialogTrigger;
export const SheetClose = DialogClose;
export const SheetHeader = DialogHeader;
export const SheetFooter = DialogFooter;
export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;
