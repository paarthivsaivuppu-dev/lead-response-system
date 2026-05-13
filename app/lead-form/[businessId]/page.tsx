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
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="app-card w-full max-w-lg p-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Form not found</h1>
          <p className="mt-3 muted-copy">
            This enquiry form is not available.
          </p>
        </section>
      </main>
    );
  }

  const currentBusiness = business as Business;

  if (submitted === "1") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="app-card w-full max-w-lg p-8 text-center">
          <div className="mx-auto mb-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-white">
            L
          </div>
          <p className="page-kicker">{currentBusiness.name}</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            Thanks — your enquiry has been received.
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto w-full max-w-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-white shadow-sm">
            L
          </div>
          <p className="page-kicker">{currentBusiness.name}</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Send an enquiry
          </h1>
          <p className="mx-auto mt-3 max-w-xl muted-copy">
            Share a few details and the team will receive your enquiry.
          </p>
        </div>

        <form
          action={submitPublicLead.bind(null, currentBusiness.id)}
          className="app-card p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                className="app-label"
                htmlFor="customer_name"
              >
                Name
              </label>
              <input
                className="app-input"
                id="customer_name"
                name="customer_name"
                required
                type="text"
              />
            </div>

            <div>
              <label
                className="app-label"
                htmlFor="customer_phone"
              >
                Phone
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
                Email
              </label>
              <input
                className="app-input"
                id="customer_email"
                name="customer_email"
                type="email"
              />
            </div>

            <div className="md:col-span-2">
              <label
                className="app-label"
                htmlFor="original_message"
              >
                Message
              </label>
              <textarea
                className="app-input min-h-36 resize-y"
                id="original_message"
                name="original_message"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-accent-dark"
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
