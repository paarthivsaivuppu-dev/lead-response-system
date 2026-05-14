"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteSelectedLeads } from "@/app/dashboard/leads/actions";
import { BookingReadinessBadge } from "@/components/leads/booking-readiness-badge";
import { SourceBadge } from "@/components/leads/source-badge";
import { StatusBadge } from "@/components/leads/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Lead } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type LeadsTableProps = {
  leads: Lead[];
};

function formatLeadName(value: string) {
  return value.includes("@") ? "Unknown" : value;
}

export function LeadsTable({ leads }: LeadsTableProps) {
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
      action={async (formData) => {
        await deleteSelectedLeads(formData);
        setSelectedIds([]);
      }}
      onSubmit={(event) => {
        if (selectedCount === 0) {
          event.preventDefault();
          return;
        }

        const confirmed = window.confirm(
          `Delete ${selectedCount} selected ${
            selectedCount === 1 ? "lead" : "leads"
          }? This cannot be undone.`
        );

        if (!confirmed) {
          event.preventDefault();
        }
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
            <SubmitButton
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
              pendingText="Deleting..."
              variant="outline"
            >
              Delete selected
            </SubmitButton>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-cyan-50/70 text-xs uppercase text-muted">
            <tr>
              <th className="w-12 px-5 py-3 font-semibold">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-5 py-3 font-semibold">Lead</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="px-5 py-3 font-semibold">Readiness</th>
              <th className="px-5 py-3 font-semibold">Source</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Created</th>
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
                <td className="px-5 py-4">
                  <Link
                    className="font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
                    href={`/dashboard/leads/${lead.id}`}
                  >
                    {formatLeadName(lead.full_name)}
                  </Link>
                </td>
                <td className="px-5 py-4 text-muted">
                  {lead.email ?? lead.phone ?? "No contact details"}
                </td>
                <td className="px-5 py-4">
                  <BookingReadinessBadge readiness={lead.booking_readiness} />
                </td>
                <td className="px-5 py-4">
                  <SourceBadge source={lead.source} />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-5 py-4 text-muted">
                  {formatDate(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}
