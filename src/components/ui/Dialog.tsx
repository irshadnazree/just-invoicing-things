import { Dialog } from "@base-ui/react/dialog";
import { X } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { Button } from "./Button";

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: "warning" | "default";
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: DialogProps) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-foreground p-6 shadow-xl transition-all data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="font-semibold text-lg text-primary-text">
              {title}
            </Dialog.Title>
            <Dialog.Close className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-primary-text">
              <X className="size-5" weight="bold" />
            </Dialog.Close>
          </div>

          {(description || children) && (
            <div className="mt-2">
              {description && (
                <Dialog.Description className="text-muted-foreground">
                  {description}
                </Dialog.Description>
              )}
              {children}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={handleCancel} variant="ghost">
              {cancelLabel}
            </Button>
            <Button
              onClick={handleConfirm}
              variant={variant === "warning" ? "danger" : "primary"}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
