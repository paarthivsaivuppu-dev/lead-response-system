import { SubmitButton } from "@/components/ui/submit-button";
import { leadStatuses, type LeadStatus } from "@/lib/types";
import { updateLeadStatus } from "@/app/dashboard/leads/actions";

type StatusButtonsProps = {
  leadId: string;
  currentStatus: LeadStatus;
};

export function StatusButtons({ leadId, currentStatus }: StatusButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {leadStatuses.map((status) => (
        <form
          action={async () => {
            "use server";
            await updateLeadStatus(leadId, status);
          }}
          key={status}
        >
          <SubmitButton
            className="min-h-9 px-3"
            pendingText="Updating..."
            variant={status === currentStatus ? "primary" : "outline"}
          >
            {status}
          </SubmitButton>
        </form>
      ))}
    </div>
  );
}
