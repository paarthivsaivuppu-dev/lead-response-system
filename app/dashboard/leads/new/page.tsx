import Link from "next/link";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { SubmitButton } from "@/components/ui/submit-button";
import { createLead } from "@/app/dashboard/leads/actions";
import { getCurrentBusiness } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewLeadPage() {
  const business = await getCurrentBusiness();

  if (!business) {
    return <EmptyBusiness />;
  }

  return (
    <div className="space-y-7">
      <Link
        className="text-sm font-medium text-muted underline-offset-4 hover:text-accent hover:underline"
        href="/dashboard/leads"
      >
        Back to leads
      </Link>

      <section>
        <p className="page-kicker">{business.name}</p>
        <h1 className="page-title">New Lead</h1>
      </section>

      <form
        action={createLead}
        className="app-card p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              className="app-label"
              htmlFor="customer_name"
            >
              Customer name
            </label>
            <input
              className="app-input"
              id="customer_name"
              name="customer_name"
              placeholder="Sarah Mitchell"
              required
              type="text"
            />
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
              className="app-label"
              htmlFor="customer_phone"
            >
              Customer phone
            </label>
            <input
              className="app-input"
              id="customer_phone"
              name="customer_phone"
              placeholder="0424 718 402"
              type="tel"
            />
          </div>

          <div>
            <label
              className="app-label"
              htmlFor="customer_email"
            >
              Customer email
            </label>
            <input
              className="app-input"
              id="customer_email"
              name="customer_email"
              placeholder="customer@example.com"
              type="email"
            />
          </div>

          <div className="md:col-span-2">
            <label
              className="app-label"
              htmlFor="original_message"
            >
              Original message
            </label>
            <textarea
              className="app-input min-h-32 resize-y"
              id="original_message"
              name="original_message"
              placeholder="What did the customer ask for?"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-cyan-50"
            href="/dashboard/leads"
          >
            Cancel
          </Link>
          <SubmitButton pendingText="Creating lead...">Create lead</SubmitButton>
        </div>
      </form>
    </div>
  );
}
