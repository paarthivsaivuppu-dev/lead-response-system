import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { getInboundEmailLogDetail } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type InboundEmailLogDetailPageProps = {
  params: Promise<{
    emailLogId: string;
  }>;
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

export default async function InboundEmailLogDetailPage({
  params
}: InboundEmailLogDetailPageProps) {
  const { emailLogId } = await params;
  const { business, lead, log } = await getInboundEmailLogDetail(emailLogId);

  if (!business) {
    return <EmptyBusiness />;
  }

  if (!log) {
    notFound();
  }

  const bodyText = log.text_body || log.body_preview || "No text body stored.";

  return (
    <div className="space-y-7">
      <Link
        className="text-sm font-medium text-muted underline-offset-4 hover:text-accent hover:underline"
        href="/dashboard/inbound-emails"
      >
        Back to inbound emails
      </Link>

      <section className="app-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="page-kicker">{business.name}</p>
            <h1 className="page-title">{log.subject || "No subject"}</h1>
            <p className="mt-2 text-sm text-muted">
              Received {formatDate(log.created_at)}
            </p>
          </div>
          {lead ? (
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-dark"
              href={`/dashboard/leads/${lead.id}`}
            >
              View linked lead
            </Link>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-cyan-50/40 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">From</p>
            <p className="mt-1 text-sm text-foreground">
              {log.from_name ?? "Unknown sender"}
            </p>
            <p className="mt-1 text-xs text-muted">{log.from_email}</p>
          </div>
          <div className="rounded-xl border border-border bg-cyan-50/40 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">To</p>
            <p className="mt-1 text-sm text-foreground">{log.to_email ?? "Unknown"}</p>
            <p className="mt-1 text-xs text-muted">
              Alias: {log.inbound_alias ?? "Not found"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-cyan-50/40 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Classification
            </p>
            <p className="mt-1 text-sm text-foreground">
              {formatLabel(log.classification)}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              {log.classification_reason ?? "No reason stored."}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-cyan-50/40 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Processing status
            </p>
            <p className="mt-1 text-sm text-foreground">
              {formatLabel(log.processing_status)}
            </p>
            {log.error_message ? (
              <p className="mt-1 text-xs leading-5 text-rose-700">
                {log.error_message}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="app-card overflow-hidden">
        <div className="app-card-header">
          <h2 className="section-title">Email body</h2>
        </div>
        <div className="p-6">
          <pre className="max-h-[560px] whitespace-pre-wrap rounded-xl border border-border bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {bodyText}
          </pre>
        </div>
      </section>

    </div>
  );
}
