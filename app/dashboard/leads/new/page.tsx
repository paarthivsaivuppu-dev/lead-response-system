import Link from "next/link";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { NewLeadForm } from "@/components/leads/new-lead-form";
import { getCurrentBusiness } from "@/lib/data";

export const dynamic = "force-dynamic";

type NewLeadPageProps = {
  searchParams: Promise<{
    error?: "invalid_email" | "invalid_phone";
  }>;
};

export default async function NewLeadPage({ searchParams }: NewLeadPageProps) {
  const { error } = await searchParams;
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
        <p className="page-kicker safe-text">{business.name}</p>
        <h1 className="page-title">New Lead</h1>
      </section>

      <NewLeadForm initialError={error} />
    </div>
  );
}
