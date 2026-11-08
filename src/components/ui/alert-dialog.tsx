'use client';

import { AlertIcon } from './icons';
import { Button } from './button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';

/** Confirm-before-you-do-it dialog. Controlled with `open`; `onConfirm` runs only on the confirm button. */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <span className={`mb-1 grid size-10 place-items-center rounded-full ${destructive ? 'bg-destructive/10 text-destructive' : 'bg-accent text-accent-foreground'}`}>
            <AlertIcon className="size-5" />
          </span>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{cancelLabel}</Button></DialogClose>
          <Button variant={destructive ? 'destructive' : 'primary'} onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
