import Link from "next/link";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { getInboundEmailLogsForCurrentBusiness } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
        styles[value] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {formatLabel(value)}
    </span>
  );
}

export default async function InboundEmailsPage() {
  const { business, logs } = await getInboundEmailLogsForCurrentBusiness();

  if (!business) {
    return <EmptyBusiness />;
  }

  return (
    <div className="space-y-7">
      <section>
        <p className="page-kicker">{business.name}</p>
        <h1 className="page-title">Inbound Emails</h1>
        <p className="mt-3 max-w-2xl muted-copy">
          Review emails received through Resend before they become leads. Gmail
          forwarding confirmations and non-enquiries are logged here instead of
          cluttering the lead list.
        </p>
      </section>

      <section className="app-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-cyan-50/70 text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Received</th>
                <th className="px-5 py-3 font-semibold">From</th>
                <th className="px-5 py-3 font-semibold">To</th>
                <th className="px-5 py-3 font-semibold">Subject</th>
                <th className="px-5 py-3 font-semibold">Classification</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {logs.map((log) => (
                <tr className="align-top transition hover:bg-cyan-50/50" key={log.id}>
                  <td className="px-5 py-4 text-muted">{formatDate(log.created_at)}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-foreground">
                      {log.from_name ?? "Unknown sender"}
                    </p>
                    <p className="mt-1 text-xs text-muted">{log.from_email}</p>
                  </td>
                  <td className="px-5 py-4 text-muted">{log.to_email ?? "Unknown"}</td>
                  <td className="px-5 py-4">
                    <Link
                      className="font-medium text-foreground underline-offset-4 hover:text-accent hover:underline"
                      href={`/dashboard/inbound-emails/${log.id}`}
                    >
                      {log.subject || "No subject"}
                    </Link>
                    <p className="mt-1 line-clamp-2 max-w-xs text-xs leading-5 text-muted">
                      {log.body_preview || "No preview available."}
                    </p>
                    {log.error_message ? (
                      <p className="mt-1 text-xs leading-5 text-rose-700">
                        {log.error_message}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4">
                    <Pill styles={classificationStyles} value={log.classification} />
                  </td>
                  <td className="px-5 py-4">
                    <Pill styles={statusStyles} value={log.processing_status} />
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
                      <span className="text-muted">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 ? (
          <p className="border-t border-border px-5 py-6 muted-copy">
            No inbound emails have been received yet.
          </p>
        ) : null}
      </section>
    </div>
  );
}
