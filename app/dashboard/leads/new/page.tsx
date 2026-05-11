import Link from "next/link";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { Button } from "@/components/ui/button";
import { createLead } from "@/app/dashboard/leads/actions";
import { getCurrentBusiness } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewLeadPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return <EmptyBusiness />;
  }

  return (
    <div className="space-y-6">
      <Link
        className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
        href="/dashboard/leads"
      >
        Back to leads
      </Link>

      <section>
        <p className="text-sm font-medium text-muted">{business.name}</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">New Lead</h1>
      </section>

      <form
        action={createLead}
        className="rounded-lg border border-border bg-white p-6 shadow-soft"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="customer_name"
            >
              Customer name
            </label>
            <input
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
              id="customer_name"
              name="customer_name"
              placeholder="Sarah Mitchell"
              required
              type="text"
            />
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
              defaultValue="manual"
              id="source"
              name="source"
            >
              <option value="manual">Manual</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="website">Website</option>
            </select>
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="customer_phone"
            >
              Customer phone
            </label>
            <input
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
              id="customer_phone"
              name="customer_phone"
              placeholder="0424 718 402"
              type="tel"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="customer_email"
            >
              Customer email
            </label>
            <input
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
              id="customer_email"
              name="customer_email"
              placeholder="customer@example.com"
              type="email"
            />
          </div>

          <div className="md:col-span-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="original_message"
            >
              Original message
            </label>
            <textarea
              className="mt-2 min-h-32 w-full resize-y rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
              id="original_message"
              name="original_message"
              placeholder="What did the customer ask for?"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            href="/dashboard/leads"
          >
            Cancel
          </Link>
          <Button type="submit">Create lead</Button>
        </div>
      </form>
    </div>
  );
}
