import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteLeadButton } from "@/components/leads/delete-lead-button";
import {
  BookingReadinessBadge,
  formatBookingReadiness
} from "@/components/leads/booking-readiness-badge";
import { SourceBadge } from "@/components/leads/source-badge";
import { StatusBadge } from "@/components/leads/status-badge";
import { StatusButtons } from "@/components/leads/status-buttons";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { formatDate } from "@/lib/utils";
import { getLeadDetail } from "@/lib/data";

export const dynamic = "force-dynamic";

function formatLabel(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatLeadName(value: string) {
  return value.includes("@") ? "Unknown" : value;
}

type LeadDetailPageProps = {
  params: Promise<{ leadId: string }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { leadId } = await params;
  const { business, lead, messages } = await getLeadDetail(leadId);

  if (!business) {
    return <EmptyBusiness />;
  }

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-7">
      <Link
        className="text-sm font-medium text-muted underline-offset-4 hover:text-accent hover:underline"
        href="/dashboard/leads"
      >
        Back to leads
      </Link>

      <section className="app-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="page-kicker">{business.name}</p>
            <h1 className="page-title">
              {formatLeadName(lead.full_name)}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Created {formatDate(lead.created_at)}
            </p>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-cyan-50/40 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Email</p>
            <p className="mt-1 text-sm text-foreground">{lead.email ?? "Not added"}</p>
          </div>
          <div className="rounded-xl border border-border bg-cyan-50/40 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Phone</p>
            <p className="mt-1 text-sm text-foreground">{lead.phone ?? "Not added"}</p>
          </div>
          <div className="rounded-xl border border-border bg-cyan-50/40 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Source</p>
            <div className="mt-2">
              <SourceBadge source={lead.source} />
            </div>
          </div>
        </div>

        {lead.notes ? (
          <div className="mt-6 rounded-xl border border-border bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Notes</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
              {lead.notes}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <DeleteLeadButton leadId={lead.id} leadName={lead.full_name} />
        </div>
      </section>

      <section className="app-card p-6">
        <h2 className="section-title">Lead status</h2>
        <p className="mt-2 muted-copy">
          Choose the current stage for this lead.
        </p>
        <div className="mt-5">
          <StatusButtons currentStatus={lead.status} leadId={lead.id} />
        </div>
      </section>

      <section className="app-card overflow-hidden">
        <div className="app-card-header">
          <h2 className="section-title">AI extraction</h2>
        </div>
        {lead.ai_extracted_at ? (
          <div className="grid gap-4 p-6 md:grid-cols-2">
            <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Booking readiness
              </p>
              <div className="mt-2">
                <BookingReadinessBadge readiness={lead.booking_readiness} />
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground">
                {lead.booking_readiness_reason ??
                  `${formatBookingReadiness(
                    lead.booking_readiness
                  )} has not been explained yet.`}
              </p>
            </div>
            <div className="rounded-xl bg-cyan-50/45 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Service requested
              </p>
              <p className="mt-1 text-sm text-foreground">
                {formatLabel(lead.service_requested)}
              </p>
            </div>
            <div className="rounded-xl bg-cyan-50/45 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Urgency
              </p>
              <p className="mt-1 text-sm text-foreground">
                {formatLabel(lead.urgency)}
              </p>
            </div>
            <div className="rounded-xl bg-cyan-50/45 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Intent
              </p>
              <p className="mt-1 text-sm text-foreground">
                {formatLabel(lead.intent)}
              </p>
            </div>
            <div className="rounded-xl bg-cyan-50/45 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Lead quality
              </p>
              <p className="mt-1 text-sm text-foreground">
                {formatLabel(lead.lead_quality)}
              </p>
            </div>
            <div className="rounded-xl bg-cyan-50/45 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Confidence
              </p>
              <p className="mt-1 text-sm text-foreground">
                {lead.confidence === null
                  ? "Unknown"
                  : `${Math.round(lead.confidence * 100)}%`}
              </p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Recommended next action
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                {lead.recommended_next_action ?? "Unknown"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Summary
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {lead.ai_summary ?? "No summary available."}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <p className="muted-copy">
              {lead.ai_extraction_error
                ? `AI extraction needs review: ${lead.ai_extraction_error}`
                : "No AI extraction has been stored for this lead yet."}
            </p>
          </div>
        )}
      </section>

      <section className="app-card overflow-hidden">
        <div className="app-card-header">
          <h2 className="section-title">Messages</h2>
        </div>
        <div className="divide-y divide-border">
          {messages.map((message) => (
            <div className="px-6 py-4" key={message.id}>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                <span>{message.direction}</span>
                <span>{message.channel}</span>
                <span>{formatDate(message.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                {message.body}
              </p>
            </div>
          ))}
          {messages.length === 0 ? (
            <p className="px-6 py-5 muted-copy">
              No messages yet. Email, SMS, and follow-ups are intentionally out
              of scope for Phase 1.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
