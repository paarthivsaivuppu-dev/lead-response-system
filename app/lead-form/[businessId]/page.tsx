import { submitPublicLead } from "@/app/lead-form/[businessId]/actions";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";

export const dynamic = "force-dynamic";

type PublicLeadFormPageProps = {
  params: Promise<{
    businessId: string;
  }>;
  searchParams: Promise<{
    submitted?: string;
  }>;
};

export default async function PublicLeadFormPage({
  params,
  searchParams
}: PublicLeadFormPageProps) {
  const { businessId } = await params;
  const { submitted } = await searchParams;
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .single();

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <section className="w-full max-w-lg rounded-lg border border-border bg-white p-8 text-center shadow-soft">
          <h1 className="text-2xl font-semibold text-slate-950">Form not found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This enquiry form is not available.
          </p>
        </section>
      </main>
    );
  }

  const currentBusiness = business as Business;

  if (submitted === "1") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <section className="w-full max-w-lg rounded-lg border border-border bg-white p-8 text-center shadow-soft">
          <p className="text-sm font-medium text-muted">{currentBusiness.name}</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Thanks — your enquiry has been received.
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto w-full max-w-2xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-muted">{currentBusiness.name}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Send an enquiry
          </h1>
        </div>

        <form
          action={submitPublicLead.bind(null, currentBusiness.id)}
          className="rounded-lg border border-border bg-white p-6 shadow-soft"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="customer_name"
              >
                Name
              </label>
              <input
                className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
                id="customer_name"
                name="customer_name"
                required
                type="text"
              />
            </div>

            <div>
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="customer_phone"
              >
                Phone
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
                Email
              </label>
              <input
                className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
                id="customer_email"
                name="customer_email"
                type="email"
              />
            </div>

            <div className="md:col-span-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="original_message"
              >
                Message
              </label>
              <textarea
                className="mt-2 min-h-36 w-full resize-y rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
                id="original_message"
                name="original_message"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              type="submit"
            >
              Send enquiry
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
