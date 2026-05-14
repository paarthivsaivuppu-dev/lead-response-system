import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getDaysRemaining } from "@/lib/business/access";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type LeadUsageRow = {
  business_id: string;
  created_at: string;
};

type RuleRow = {
  business_id: string;
  rule_type: string;
  rule_value: { enabled?: boolean } | null;
};

function getPlatformAdminEmails() {
  return (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function formatLabel(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return value
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDaysRemaining(value: number | null) {
  if (value === null) {
    return "Not set";
  }

  if (value < 0) {
    return "Expired";
  }

  if (value === 0) {
    return "Ends today";
  }

  return `${value} ${value === 1 ? "day" : "days"}`;
}

function getRuleEnabled(
  rulesByBusiness: Map<string, Map<string, boolean>>,
  businessId: string,
  ruleType: string
) {
  return rulesByBusiness.get(businessId)?.get(ruleType) === true;
}

export default async function AdminBusinessesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const adminEmails = getPlatformAdminEmails();
  const userEmail = user?.email?.toLowerCase() ?? "";

  if (!user || !adminEmails.includes(userEmail)) {
    notFound();
  }

  const admin = createAdminClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [{ data: businesses }, { data: leads }, { data: rules }] =
    await Promise.all([
      admin.from("businesses").select("*").order("created_at", {
        ascending: false
      }),
      admin
        .from("leads")
        .select("business_id, created_at")
        .order("created_at", { ascending: false }),
      admin
        .from("business_rules")
        .select("business_id, rule_type, rule_value")
        .in("rule_type", ["sms_alerts_enabled", "email_notifications_enabled"])
    ]);

  const leadRows = (leads ?? []) as LeadUsageRow[];
  const ruleRows = (rules ?? []) as RuleRow[];
  const leadsByBusiness = new Map<string, LeadUsageRow[]>();
  const rulesByBusiness = new Map<string, Map<string, boolean>>();

  for (const lead of leadRows) {
    const existing = leadsByBusiness.get(lead.business_id) ?? [];
    existing.push(lead);
    leadsByBusiness.set(lead.business_id, existing);
  }

  for (const rule of ruleRows) {
    const existing = rulesByBusiness.get(rule.business_id) ?? new Map();
    existing.set(rule.rule_type, rule.rule_value?.enabled === true);
    rulesByBusiness.set(rule.business_id, existing);
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto max-w-7xl space-y-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-base font-semibold text-foreground"
              href="/dashboard"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-white shadow-sm">
                <Sparkles className="h-4 w-4" strokeWidth={2.4} />
              </span>
              ClinicResponse AI
            </Link>
            <p className="page-kicker mt-8">Internal admin</p>
            <h1 className="page-title">Pilot Businesses</h1>
          </div>
        </div>

        <section className="app-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
              <thead className="bg-cyan-50/70 text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Business</th>
                  <th className="px-5 py-3 font-semibold">Pilot</th>
                  <th className="px-5 py-3 font-semibold">Subscription</th>
                  <th className="px-5 py-3 font-semibold">Days</th>
                  <th className="px-5 py-3 font-semibold">Pilot ends</th>
                  <th className="px-5 py-3 font-semibold">Total leads</th>
                  <th className="px-5 py-3 font-semibold">Last 30 days</th>
                  <th className="px-5 py-3 font-semibold">Last lead</th>
                  <th className="px-5 py-3 font-semibold">Inbound alias</th>
                  <th className="px-5 py-3 font-semibold">SMS</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {((businesses ?? []) as Business[]).map((business) => {
                  const businessLeads = leadsByBusiness.get(business.id) ?? [];
                  const recentLeadCount = businessLeads.filter(
                    (lead) => new Date(lead.created_at) >= thirtyDaysAgo
                  ).length;
                  const lastLead = businessLeads[0]?.created_at ?? null;

                  return (
                    <tr className="align-middle transition hover:bg-cyan-50/50" key={business.id}>
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{business.name}</p>
                        <p className="mt-1 text-xs text-muted">{business.id}</p>
                      </td>
                      <td className="px-5 py-4">{formatLabel(business.pilot_status)}</td>
                      <td className="px-5 py-4">
                        {formatLabel(business.subscription_status)}
                      </td>
                      <td className="px-5 py-4">
                        {formatDaysRemaining(getDaysRemaining(business.pilot_ends_at))}
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {business.pilot_ends_at
                          ? formatDate(business.pilot_ends_at)
                          : "Not set"}
                      </td>
                      <td className="px-5 py-4">{businessLeads.length}</td>
                      <td className="px-5 py-4">{recentLeadCount}</td>
                      <td className="px-5 py-4 text-muted">
                        {lastLead ? formatDate(lastLead) : "No leads"}
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {business.inbound_email_alias ?? "Not set"}
                      </td>
                      <td className="px-5 py-4">
                        {getRuleEnabled(
                          rulesByBusiness,
                          business.id,
                          "sms_alerts_enabled"
                        )
                          ? "On"
                          : "Off"}
                      </td>
                      <td className="px-5 py-4">
                        {getRuleEnabled(
                          rulesByBusiness,
                          business.id,
                          "email_notifications_enabled"
                        )
                          ? "On"
                          : "Off"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {businesses?.length === 0 ? (
            <p className="border-t border-border px-5 py-6 muted-copy">
              No businesses found yet.
            </p>
          ) : null}
        </section>
      </section>
    </main>
  );
}
