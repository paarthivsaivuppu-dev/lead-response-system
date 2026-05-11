"use client";

import { deleteLead } from "@/app/dashboard/leads/actions";
import { Button } from "@/components/ui/button";

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
      <Button
        className="border-red-200 text-red-700 hover:bg-red-50"
        type="submit"
        variant="outline"
      >
        Delete Lead
      </Button>
    </form>
  );
}
