"use client";

import { deleteLead } from "@/app/dashboard/leads/actions";
import { SubmitButton } from "@/components/ui/submit-button";

type DeleteLeadButtonProps = {
  leadId: string;
  leadName: string;
};

export function DeleteLeadButton({ leadId, leadName }: DeleteLeadButtonProps) {
  return (
    <form
      action={async () => {
        await deleteLead(leadId);
      }}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete ${leadName}? This cannot be undone.`
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton
        className="border-rose-200 text-rose-700 hover:bg-rose-50"
        pendingText="Deleting..."
        variant="outline"
      >
        Delete Lead
      </SubmitButton>
    </form>
  );
}
