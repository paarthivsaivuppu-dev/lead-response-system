import Link from "next/link";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { LeadsTable } from "@/components/leads/leads-table";
import { leadStatuses } from "@/lib/types";
import { getLeadsForCurrentBusiness } from "@/lib/data";

export const dynamic = "force-dynamic";

const sourceOptions = ["manual", "email", "sms", "website"];

type LeadsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    source?: string;
  }>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const filters = await searchParams;
  const query = (filters.q ?? "").trim();
  const statusFilter = filters.status ?? "All";
  const sourceFilter = filters.source ?? "All";
  const { business, leads } = await getLeadsForCurrentBusiness();

  if (!business) {
    return <EmptyBusiness />;
  }

  const normalizedQuery = query.toLowerCase();
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !normalizedQuery ||
      lead.full_name.toLowerCase().includes(normalizedQuery) ||
      (lead.email ?? "").toLowerCase().includes(normalizedQuery) ||
      (lead.phone ?? "").toLowerCase().includes(normalizedQuery);
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "All" || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <div className="space-y-7">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="page-kicker">{business.name}</p>
            <h1 className="page-title">Leads</h1>
          </div>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-dark"
            href="/dashboard/leads/new"
          >
            New Lead
          </Link>
        </div>
      </section>

      <form className="app-card p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_180px_180px_auto_auto] md:items-end">
          <div>
            <label className="app-label" htmlFor="q">
              Search
            </label>
            <input
              className="app-input"
              defaultValue={query}
              id="q"
              name="q"
              placeholder="Name, email, or phone"
              type="search"
            />
          </div>

          <div>
            <label
              className="app-label"
              htmlFor="status"
            >
              Status
            </label>
            <select
              className="app-input"
              defaultValue={statusFilter}
              id="status"
              name="status"
            >
              <option value="All">All</option>
              {leadStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="app-label"
              htmlFor="source"
            >
              Source
            </label>
            <select
              className="app-input"
              defaultValue={sourceFilter}
              id="source"
              name="source"
            >
              <option value="All">All</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <button
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-dark"
            type="submit"
          >
            Apply
          </button>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-cyan-50"
            href="/dashboard/leads"
          >
            Clear
          </Link>
        </div>
      </form>

      <section className="app-card overflow-hidden">
        <LeadsTable leads={filteredLeads} />
        {filteredLeads.length === 0 ? (
          <p className="border-t border-border px-5 py-6 muted-copy">
            No leads match these filters.
          </p>
        ) : null}
      </section>
    </div>
  );
}
