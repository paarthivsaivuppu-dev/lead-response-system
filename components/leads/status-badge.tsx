import type { LeadStatus } from "@/lib/types";

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700 ring-blue-200",
  Contacted: "bg-sky-50 text-sky-700 ring-sky-200",
  Replied: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Ready for Staff": "bg-violet-50 text-violet-700 ring-violet-200",
  Booked: "bg-green-50 text-green-700 ring-green-200",
  Lost: "bg-slate-100 text-slate-700 ring-slate-200",
  Invalid: "bg-red-50 text-red-700 ring-red-200",
  "Needs Review": "bg-amber-50 text-amber-800 ring-amber-200"
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
