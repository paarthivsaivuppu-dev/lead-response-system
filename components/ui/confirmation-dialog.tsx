"use client";

import { Button } from "@/components/ui/button";

type ConfirmationDialogProps = {
  body: string;
  cancelLabel?: string;
  confirmLabel: string;
  isOpen: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  pendingLabel?: string;
  title: string;
};

export function ConfirmationDialog({
  body,
  cancelLabel = "Cancel",
  confirmLabel,
  isOpen,
  isPending = false,
  onCancel,
  onConfirm,
  pendingLabel = "Working...",
  title
}: ConfirmationDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="confirmation-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-[2px]"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl">
        <h2
          className="text-lg font-semibold text-foreground"
          id="confirmation-dialog-title"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            disabled={isPending}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            {cancelLabel}
          </Button>
          <Button
            className="bg-rose-600 text-white hover:bg-rose-700"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
