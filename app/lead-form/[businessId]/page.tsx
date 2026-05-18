import { Sparkles } from "lucide-react";
import { PublicLeadForm } from "@/components/lead-form/public-lead-form";
import { isBusinessAccessible } from "@/lib/business/access";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";

export const dynamic = "force-dynamic";

type PublicLeadFormPageProps = {
  params: Promise<{
    businessId: string;
  }>;
  searchParams: Promise<{
    error?: "invalid_email" | "invalid_phone";
    submitted?: string;
  }>;
};

export default async function PublicLeadFormPage({
  params,
  searchParams
}: PublicLeadFormPageProps) {
  const { businessId } = await params;
  const { error, submitted } = await searchParams;
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

  if (!isBusinessAccessible(currentBusiness)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="app-card w-full max-w-lg p-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Form not available
          </h1>
          <p className="mt-3 muted-copy">
            This clinic enquiry form is not currently accepting new enquiries.
          </p>
        </section>
      </main>
    );
  }

  if (submitted === "1") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <section className="app-card w-full max-w-lg p-8 text-center">
          <div className="mx-auto mb-5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-white">
            <Sparkles className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <p className="page-kicker safe-text">{currentBusiness.name}</p>
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
            <Sparkles className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <p className="page-kicker safe-text">{currentBusiness.name}</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Send an enquiry
          </h1>
        </div>

        <PublicLeadForm businessId={currentBusiness.id} initialError={error} />
      </section>
    </main>
  );
}
