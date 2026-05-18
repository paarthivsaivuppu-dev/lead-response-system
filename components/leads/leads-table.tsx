"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { deleteSelectedLeads } from "@/app/dashboard/leads/actions";
import { BookingReadinessBadge } from "@/components/leads/booking-readiness-badge";
import { SourceBadge } from "@/components/leads/source-badge";
import { StatusBadge } from "@/components/leads/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { Lead } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type LeadsTableProps = {
  leads: Lead[];
};

function formatLeadName(value: string) {
  return value.includes("@") ? "Unknown" : value;
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedCount = selectedIds.length;
  const allSelected = leads.length > 0 && selectedCount === leads.length;

  function toggleAll() {
    setSelectedIds(allSelected ? [] : leads.map((lead) => lead.id));
  }

  function toggleLead(leadId: string) {
    setSelectedIds((currentIds) =>
      currentIds.includes(leadId)
        ? currentIds.filter((currentId) => currentId !== leadId)
        : [...currentIds, leadId]
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();

        if (selectedCount === 0) {
          return;
        }

        setIsConfirmOpen(true);
      }}
    >
      {selectedIds.map((leadId) => (
        <input key={leadId} name="lead_ids" type="hidden" value={leadId} />
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-white px-5 py-3">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            checked={allSelected}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
            onChange={toggleAll}
            type="checkbox"
          />
          Select all
        </label>

        {selectedCount > 0 ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              {selectedCount} selected
            </span>
            <Button
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
              disabled={isPending}
              type="submit"
              variant="outline"
            >
              {isPending ? "Deleting..." : "Delete selected"}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-cyan-50/70 text-xs uppercase text-muted">
            <tr>
              <th className="w-12 px-5 py-3 font-semibold">
                <span className="sr-only">Select</span>
              </th>
              <th className="w-64 px-5 py-3 font-semibold">Lead</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="w-28 px-5 py-3 font-semibold">Readiness</th>
              <th className="w-28 px-5 py-3 font-semibold">Source</th>
              <th className="w-36 px-5 py-3 font-semibold">Status</th>
              <th className="w-28 px-5 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {leads.map((lead) => (
              <tr className="transition hover:bg-cyan-50/50" key={lead.id}>
                <td className="px-5 py-4">
                  <input
                    checked={selectedIds.includes(lead.id)}
                    className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
                    onChange={() => toggleLead(lead.id)}
                    type="checkbox"
                  />
                </td>
                <td className="min-w-0 px-5 py-4">
                  <Link
                    className="safe-line block font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
                    href={`/dashboard/leads/${lead.id}`}
                    title={formatLeadName(lead.full_name)}
                  >
                    {formatLeadName(lead.full_name)}
                  </Link>
                </td>
                <td className="min-w-0 px-5 py-4 text-muted">
                  <span className="safe-line block" title={lead.email ?? lead.phone ?? "No contact details"}>
                  {lead.email ?? lead.phone ?? "No contact details"}
                  </span>
                </td>
                <td className="px-5 py-4 align-middle">
                  <BookingReadinessBadge compact readiness={lead.booking_readiness} />
                </td>
                <td className="px-5 py-4 align-middle">
                  <SourceBadge source={lead.source} />
                </td>
                <td className="px-5 py-4 align-middle">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-muted">
                  {formatDate(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmationDialog
        body={`This will permanently remove ${selectedCount} ${
          selectedCount === 1 ? "lead" : "leads"
        } from the dashboard. This cannot be undone.`}
        confirmLabel={selectedCount === 1 ? "Delete lead" : "Delete leads"}
        isOpen={isConfirmOpen}
        isPending={isPending}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          const form = formRef.current;

          if (!form) {
            return;
          }

          startTransition(() => {
            void deleteSelectedLeads(new FormData(form)).then(() => {
              setSelectedIds([]);
              setIsConfirmOpen(false);
            });
          });
        }}
        pendingLabel="Deleting..."
        title={selectedCount === 1 ? "Delete selected lead?" : "Delete selected leads?"}
      />
    </form>
  );
}
