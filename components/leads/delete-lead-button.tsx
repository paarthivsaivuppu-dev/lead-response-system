"use client";

import { useState, useTransition } from "react";
import { deleteLead } from "@/app/dashboard/leads/actions";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";

type DeleteLeadButtonProps = {
  leadId: string;
  leadName: string;
};

export function DeleteLeadButton({ leadId, leadName }: DeleteLeadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button
        className="border-rose-200 text-rose-700 hover:bg-rose-50"
        onClick={() => setIsOpen(true)}
        type="button"
        variant="outline"
      >
        Delete Lead
      </Button>
      <ConfirmationDialog
        body={`This will permanently remove ${leadName} from the dashboard. This cannot be undone.`}
        confirmLabel="Delete lead"
        isOpen={isOpen}
        isPending={isPending}
        onCancel={() => setIsOpen(false)}
        onConfirm={() => {
          startTransition(() => {
            void deleteLead(leadId);
          });
        }}
        pendingLabel="Deleting..."
        title="Delete lead?"
      />
    </>
  );
}
