"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { deleteSelectedInboundEmailLogs } from "@/app/dashboard/inbound-emails/actions";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type {
  InboundEmailClassification,
  InboundEmailLog,
  InboundEmailProcessingStatus
} from "@/lib/types";
import { formatDate } from "@/lib/utils";

type InboundEmailLogsTableProps = {
  logs: InboundEmailLog[];
};

const classificationStyles: Record<string, string> = {
  enquiry: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  non_enquiry: "bg-slate-100 text-slate-700 ring-slate-200",
  verification: "bg-cyan-50 text-accent ring-cyan-200",
  unsure: "bg-amber-50 text-amber-800 ring-amber-200"
};

const statusStyles: Record<string, string> = {
  received: "bg-slate-100 text-slate-700 ring-slate-200",
  skipped: "bg-slate-100 text-slate-700 ring-slate-200",
  lead_created: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  needs_review: "bg-amber-50 text-amber-800 ring-amber-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200"
};

function formatLabel(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return value
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function Pill({
  styles,
  value
}: {
  styles: Record<string, string>;
  value: string;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 ring-1 ${
        styles[value] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {formatLabel(value)}
    </span>
  );
}

function getSenderDisplay({
  fromEmail,
  fromName
}: {
  fromEmail: string | null;
  fromName: string | null;
}) {
  if (fromName && fromEmail) {
    return {
      primary: fromName,
      secondary: fromEmail
    };
  }

  if (fromName) {
    return {
      primary: fromName,
      secondary: null
    };
  }

  if (fromEmail) {
    return {
      primary: fromEmail,
      secondary: null
    };
  }

  return {
    primary: "Unknown sender",
    secondary: null
  };
}

function getDisplayState(log: InboundEmailLog): {
  classification: InboundEmailClassification;
  processingStatus: InboundEmailProcessingStatus;
} {
  if (log.processing_status === "lead_created" && !log.lead_id) {
    return {
      classification: "unsure",
      processingStatus: "needs_review"
    };
  }

  return {
    classification: log.classification,
    processingStatus: log.processing_status
  };
}

export function InboundEmailLogsTable({ logs }: InboundEmailLogsTableProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedCount = selectedIds.length;
  const allSelected = logs.length > 0 && selectedCount === logs.length;

  function toggleAll() {
    setSelectedIds(allSelected ? [] : logs.map((log) => log.id));
  }

  function toggleLog(logId: string) {
    setSelectedIds((currentIds) =>
      currentIds.includes(logId)
        ? currentIds.filter((currentId) => currentId !== logId)
        : [...currentIds, logId]
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
      {selectedIds.map((logId) => (
        <input key={logId} name="log_ids" type="hidden" value={logId} />
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
            <span className="text-sm text-muted">{selectedCount} selected</span>
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
        <table className="w-full min-w-[980px] table-fixed border-collapse text-left text-sm">
          <thead className="bg-cyan-50/70 text-xs uppercase text-muted">
            <tr>
              <th className="w-12 px-5 py-3 font-semibold">
                <span className="sr-only">Select</span>
              </th>
              <th className="w-24 px-5 py-3 font-semibold">Received</th>
              <th className="w-64 px-5 py-3 font-semibold">From</th>
              <th className="px-5 py-3 font-semibold">Subject</th>
              <th className="w-36 px-5 py-3 font-semibold">Classification</th>
              <th className="w-36 px-5 py-3 font-semibold">Status</th>
              <th className="w-28 px-5 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {logs.map((log) => {
              const sender = getSenderDisplay({
                fromEmail: log.from_email,
                fromName: log.from_name
              });
              const displayState = getDisplayState(log);

              return (
                <tr
                  className="align-middle transition hover:bg-cyan-50/50"
                  key={log.id}
                >
                  <td className="px-5 py-4">
                    <input
                      checked={selectedIds.includes(log.id)}
                      className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
                      onChange={() => toggleLog(log.id)}
                      type="checkbox"
                    />
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="min-w-0 px-5 py-4">
                    <p
                      className="safe-line font-medium text-foreground"
                      title={sender.primary}
                    >
                      {sender.primary}
                    </p>
                    {sender.secondary ? (
                      <p
                        className="safe-line mt-1 text-xs text-muted"
                        title={sender.secondary}
                      >
                        {sender.secondary}
                      </p>
                    ) : null}
                  </td>
                  <td className="min-w-0 px-5 py-4">
                    <Link
                      className="safe-line block font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
                      href={`/dashboard/inbound-emails/${log.id}`}
                      title={log.subject || "No subject"}
                    >
                      {log.subject || "No subject"}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                      {log.body_preview || "No preview available."}
                    </p>
                    {log.error_message ? (
                      <p className="safe-text mt-1 text-xs leading-5 text-rose-700">
                        {log.error_message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <Pill
                      styles={classificationStyles}
                      value={displayState.classification}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <Pill
                      styles={statusStyles}
                      value={displayState.processingStatus}
                    />
                  </td>
                  <td className="px-5 py-4">
                    {log.lead_id ? (
                      <Link
                        className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                        href={`/dashboard/leads/${log.lead_id}`}
                      >
                        View lead
                      </Link>
                    ) : (
                      <Link
                        className="text-sm font-medium text-accent underline-offset-4 hover:underline"
                        href={`/dashboard/inbound-emails/${log.id}`}
                      >
                        Review email
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {logs.length === 0 ? (
        <p className="border-t border-border px-5 py-6 muted-copy">
          No inbound emails have been received yet.
        </p>
      ) : null}

      <ConfirmationDialog
        body="This will remove the selected email logs. Any linked leads will remain."
        confirmLabel="Delete logs"
        isOpen={isConfirmOpen}
        isPending={isPending}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          const form = formRef.current;

          if (!form) {
            return;
          }

          startTransition(() => {
            void deleteSelectedInboundEmailLogs(new FormData(form)).then(() => {
              setSelectedIds([]);
              setIsConfirmOpen(false);
            });
          });
        }}
        pendingLabel="Deleting..."
        title="Delete email logs?"
      />
    </form>
  );
}
