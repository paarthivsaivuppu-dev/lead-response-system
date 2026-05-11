import Link from "next/link";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { StatusBadge } from "@/components/leads/status-badge";
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
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-muted">{business.name}</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">Dashboard</h1>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-600">Total leads</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {leads.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-600">Open leads</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {openLeads.length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-600">Booked</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">
            {leads.filter((lead) => lead.status === "Booked").length}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">Recent leads</h2>
          <Link
            className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
            href="/dashboard/leads"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {leads.slice(0, 5).map((lead) => (
            <Link
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
              href={`/dashboard/leads/${lead.id}`}
              key={lead.id}
            >
              <div>
                <p className="font-medium text-slate-950">{lead.full_name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {lead.email ?? lead.phone ?? "No contact details"}
                </p>
              </div>
              <StatusBadge status={lead.status} />
            </Link>
          ))}
          {leads.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-600">
              No leads yet. Add the seed data to see a sample lead.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
