import Link from "next/link";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { StatusBadge } from "@/components/leads/status-badge";
import { leadStatuses } from "@/lib/types";
import { formatDate } from "@/lib/utils";
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
    <div className="space-y-6">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted">{business.name}</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-950">Leads</h1>
          </div>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            href="/dashboard/leads/new"
          >
            New Lead
          </Link>
        </div>
      </section>

      <form className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-[1fr_180px_180px_auto_auto] md:items-end">
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="q">
              Search
            </label>
            <input
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
              defaultValue={query}
              id="q"
              name="q"
              placeholder="Name, email, or phone"
              type="search"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="status"
            >
              Status
            </label>
            <select
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
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
              className="text-sm font-medium text-slate-700"
              htmlFor="source"
            >
              Source
            </label>
            <select
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
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
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            type="submit"
          >
            Apply
          </button>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            href="/dashboard/leads"
          >
            Clear
          </Link>
        </div>
      </form>

      <section className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Lead</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="px-5 py-3 font-semibold">Source</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLeads.map((lead) => (
              <tr className="hover:bg-slate-50" key={lead.id}>
                <td className="px-5 py-4">
                  <Link
                    className="font-medium text-slate-950 underline-offset-4 hover:underline"
                    href={`/dashboard/leads/${lead.id}`}
                  >
                    {lead.full_name}
                  </Link>
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {lead.email ?? lead.phone ?? "No contact details"}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {lead.source ?? "Unknown"}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {formatDate(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 ? (
          <p className="border-t border-border px-5 py-6 text-sm text-slate-600">
            No leads match these filters.
          </p>
        ) : null}
      </section>
    </div>
  );
}
