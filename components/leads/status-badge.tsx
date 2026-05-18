import type { LeadStatus } from "@/lib/types";

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-cyan-50 text-accent ring-cyan-200",
  Contacted: "bg-teal-100 text-teal-800 ring-teal-200",
  Replied: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  "Ready for Staff": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Booked: "bg-green-50 text-green-800 ring-green-200",
  Lost: "bg-slate-100 text-slate-700 ring-slate-200",
  Invalid: "bg-rose-50 text-rose-700 ring-rose-200",
  "Needs Review": "bg-amber-50 text-amber-800 ring-amber-200"
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 ring-1 ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
