"use client";

import { useState, useTransition } from "react";
import {
  deleteInboundEmailLogAndLinkedLead,
  deleteInboundEmailLogOnly
} from "@/app/dashboard/inbound-emails/actions";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

type InboundEmailDeleteActionsProps = {
  hasLinkedLead: boolean;
  logId: string;
};

export function InboundEmailDeleteActions({
  hasLinkedLead,
  logId
}: InboundEmailDeleteActionsProps) {
  const [activeAction, setActiveAction] = useState<"log" | "both" | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="app-card overflow-hidden">
      <div className="app-card-header">
        <h2 className="section-title">Cleanup actions</h2>
      </div>
      <div className="grid gap-3 p-6 md:grid-cols-2">
        <Button
          className="w-full justify-center border-border bg-white text-slate-700 hover:bg-slate-50"
          disabled={isPending}
          onClick={() => setActiveAction("log")}
          type="button"
          variant="outline"
        >
          Delete email log only
        </Button>

        {hasLinkedLead ? (
          <Button
            className="w-full justify-center border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            disabled={isPending}
            onClick={() => setActiveAction("both")}
            type="button"
            variant="outline"
          >
            Delete email and linked lead
          </Button>
        ) : null}
      </div>

      <ConfirmationDialog
        body="This will remove the email log. Any linked lead will remain."
        confirmLabel="Delete log"
        isOpen={activeAction === "log"}
        isPending={isPending}
        onCancel={() => setActiveAction(null)}
        onConfirm={() => {
          startTransition(() => {
            void deleteInboundEmailLogOnly(logId);
          });
        }}
        pendingLabel="Deleting..."
        title="Delete email log?"
      />

      <ConfirmationDialog
        body="This will remove the email log and the lead it created. This cannot be undone."
        confirmLabel="Delete both"
        isOpen={activeAction === "both"}
        isPending={isPending}
        onCancel={() => setActiveAction(null)}
        onConfirm={() => {
          startTransition(() => {
            void deleteInboundEmailLogAndLinkedLead(logId);
          });
        }}
        pendingLabel="Deleting..."
        title="Delete email and linked lead?"
      />
    </div>
  );
}
