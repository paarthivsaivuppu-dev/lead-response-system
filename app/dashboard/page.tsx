import Link from "next/link";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { SourceBadge } from "@/components/leads/source-badge";
import { StatusBadge } from "@/components/leads/status-badge";
import { formatDate } from "@/lib/utils";
import { getLeadsForCurrentBusiness } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { business, leads } = await getLeadsForCurrentBusiness();

  if (!business) {
    return <EmptyBusiness />;
  }

  const openLeads = leads.filter((lead) =>
    ["New", "Contacted", "Replied", "Needs Review"].includes(lead.status)
  );

  return (
    <div className="space-y-7">
      <section>
        <p className="page-kicker">{business.name}</p>
        <h1 className="page-title">Dashboard</h1>
        <p className="mt-3 max-w-2xl muted-copy">
          A clear view of new enquiries, current status, and what your team
          needs to handle next.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="app-card p-5">
          <p className="text-sm font-medium text-muted">Total leads</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {leads.length}
          </p>
        </div>
        <div className="app-card p-5">
          <p className="text-sm font-medium text-muted">Open leads</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {openLeads.length}
          </p>
        </div>
        <div className="app-card p-5">
          <p className="text-sm font-medium text-muted">Booked</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {leads.filter((lead) => lead.status === "Booked").length}
          </p>
        </div>
      </section>

      <section className="app-card overflow-hidden">
        <div className="app-card-header flex items-center justify-between">
          <h2 className="section-title">Recent leads</h2>
          <Link
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
            href="/dashboard/leads"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {leads.slice(0, 5).map((lead) => (
            <Link
              className="grid gap-3 px-5 py-4 transition hover:bg-cyan-50/50 md:grid-cols-[1.2fr_1fr_auto_auto] md:items-center"
              href={`/dashboard/leads/${lead.id}`}
              key={lead.id}
            >
              <div>
                <p className="font-medium text-foreground">{lead.full_name}</p>
                <p className="mt-1 text-sm text-muted">
                  {lead.email ?? lead.phone ?? "No contact details"}
                </p>
              </div>
              <p className="text-sm text-slate-700">
                {lead.service_requested ?? "No service captured yet"}
              </p>
              <SourceBadge source={lead.source} />
              <div className="md:text-right">
                <StatusBadge status={lead.status} />
                <p className="mt-1 text-xs text-muted">{formatDate(lead.created_at)}</p>
              </div>
            </Link>
          ))}
          {leads.length === 0 ? (
            <p className="px-5 py-6 muted-copy">
              No leads yet. New enquiries will appear here as they are captured.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
