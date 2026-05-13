import { Button } from "@/components/ui/button";
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
          <Button
            className="min-h-9 px-3"
            type="submit"
            variant={status === currentStatus ? "primary" : "outline"}
          >
            {status}
          </Button>
        </form>
      ))}
    </div>
  );
}
