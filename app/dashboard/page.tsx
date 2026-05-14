import Link from "next/link";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { SourceBadge } from "@/components/leads/source-badge";
import { StatusBadge } from "@/components/leads/status-badge";
import { getLeadsForCurrentBusiness } from "@/lib/data";

export const dynamic = "force-dynamic";

function formatLabel(value: string | null) {
  if (!value) {
    return "No Service Captured Yet";
  }

  return value
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatLeadName(value: string) {
  return value.includes("@") ? "Unknown" : value;
}

function isOlderThanHours(value: string, hours: number) {
  const createdAt = new Date(value).getTime();

  if (Number.isNaN(createdAt)) {
    return false;
  }

  return Date.now() - createdAt > hours * 60 * 60 * 1000;
}

function getTreatmentDemand(
  leads: Awaited<ReturnType<typeof getLeadsForCurrentBusiness>>["leads"]
) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const counts = new Map<string, number>();
  let recentLeadCount = 0;
  let unclassifiedCount = 0;

  for (const lead of leads) {
    const createdAt = new Date(lead.created_at).getTime();
    const service = lead.service_requested?.trim();

    if (Number.isNaN(createdAt) || createdAt < thirtyDaysAgo) {
      continue;
    }

    recentLeadCount += 1;

    if (
      !service ||
      ["unknown", "not specified", "no service captured yet"].includes(
        service.toLowerCase()
      )
    ) {
      unclassifiedCount += 1;
      continue;
    }

    const normalizedService = formatLabel(service.toLowerCase());
    counts.set(normalizedService, (counts.get(normalizedService) ?? 0) + 1);
  }

  const services = Array.from(counts.entries())
    .map(([service, count]) => ({ service, count }))
    .sort((a, b) => b.count - a.count || a.service.localeCompare(b.service));
  const topServices = services.slice(0, 5);
  const otherServicesCount = services
    .slice(5)
    .reduce((total, service) => total + service.count, 0);

  return {
    countedLeadCount: recentLeadCount - unclassifiedCount,
    otherServicesCount,
    recentLeadCount,
    services,
    topServices,
    unclassifiedCount
  };
}

export default async function DashboardPage() {
  const { business, leads } = await getLeadsForCurrentBusiness();

  if (!business) {
    return <EmptyBusiness />;
  }

  const openLeads = leads.filter((lead) =>
    ["New", "Contacted", "Replied", "Needs Review"].includes(lead.status)
  );
  const contactedStatuses = ["Contacted", "Replied", "Booked", "Lost", "Invalid"];
  const bookingReadyNotContacted = leads.filter(
    (lead) =>
      lead.booking_readiness === "booking_ready" &&
      !contactedStatuses.includes(lead.status)
  );
  const olderNewLeads = leads.filter(
    (lead) => lead.status === "New" && isOlderThanHours(lead.created_at, 24)
  );
  const leadsNeedingFollowUp = leads.filter(
    (lead) => lead.status === "Contacted" && isOlderThanHours(lead.created_at, 24)
  );
  const leakageRows = [
    ...bookingReadyNotContacted.map((lead) => ({
      lead,
      reason: "Booking-ready, not contacted"
    })),
    ...olderNewLeads.map((lead) => ({
      lead,
      reason: "New for more than 24 hours"
    })),
    ...leadsNeedingFollowUp.map((lead) => ({
      lead,
      reason: "Contacted, may need follow-up"
    }))
  ].filter(
    (row, index, rows) =>
      rows.findIndex((candidate) => candidate.lead.id === row.lead.id) === index
  );
  const totalLeakageCount =
    bookingReadyNotContacted.length +
    olderNewLeads.length +
    leadsNeedingFollowUp.length;
  const leakageMetrics = [
    {
      label: "Booking-ready",
      value: bookingReadyNotContacted.length,
      color: "bg-teal-500"
    },
    {
      label: "Going cold",
      value: olderNewLeads.length,
      color: "bg-amber-400"
    },
    {
      label: "Follow-up",
      value: leadsNeedingFollowUp.length,
      color: "bg-cyan-500"
    }
  ];
  const treatmentDemand = getTreatmentDemand(leads);
  const treatmentDemandRows =
    treatmentDemand.otherServicesCount > 0
      ? [
          ...treatmentDemand.topServices,
          {
            service: "Other services",
            count: treatmentDemand.otherServicesCount
          }
        ]
      : treatmentDemand.topServices;
  const totalTreatmentDemandCount = treatmentDemand.countedLeadCount;
  const topTreatmentTies = treatmentDemand.services.filter(
    (service) => service.count === treatmentDemand.services[0]?.count
  ).length;
  const todayPriority =
    bookingReadyNotContacted.length > 0
      ? `${bookingReadyNotContacted.length} booking-ready ${
          bookingReadyNotContacted.length === 1
            ? "enquiry is"
            : "enquiries are"
        } still waiting for first contact.`
      : olderNewLeads.length > 0
        ? `${olderNewLeads.length} new ${
            olderNewLeads.length === 1 ? "lead has" : "leads have"
          } been waiting over 24 hours.`
        : "No urgent lead issues right now.";
  const topRequestedService =
    treatmentDemand.countedLeadCount === 0
      ? "Not enough demand data yet."
      : topTreatmentTies > 1
        ? "Several services are tied for top demand."
        : `Most requested: ${treatmentDemand.services[0].service}.`;
  const followUpStatus =
    leadsNeedingFollowUp.length > 0
      ? `${leadsNeedingFollowUp.length} contacted ${
          leadsNeedingFollowUp.length === 1 ? "lead may" : "leads may"
        } need follow-up.`
      : "No obvious follow-up backlog.";
  const pulseInsights = [
    {
      label: "Today's priority",
      value: todayPriority
    },
    {
      label: "Top requested service",
      value: topRequestedService
    },
    {
      label: "Follow-up status",
      value: followUpStatus
    }
  ];

  return (
    <div className="space-y-7">
      <section>
        <p className="page-kicker">{business.name}</p>
        <h1 className="page-title">Dashboard</h1>
      </section>

      <section className="grid w-full items-stretch gap-4 md:grid-cols-3">
        <div className="app-card flex min-h-28 flex-col justify-center p-5">
          <p className="text-sm font-medium text-muted">Total leads</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {leads.length}
          </p>
        </div>
        <div className="app-card flex min-h-28 flex-col justify-center p-5">
          <p className="text-sm font-medium text-muted">Open leads</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {openLeads.length}
          </p>
        </div>
        <div className="app-card flex min-h-28 flex-col justify-center p-5">
          <p className="text-sm font-medium text-muted">Booked</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {leads.filter((lead) => lead.status === "Booked").length}
          </p>
        </div>
      </section>

      <section className="app-card overflow-hidden">
        <div className="app-card-header">
          <h2 className="section-title">Clinic Pulse</h2>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-3">
          {pulseInsights.map((insight) => (
            <div
              className="rounded-xl border border-border bg-cyan-50/30 p-4"
              key={insight.label}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                {insight.label}
              </p>
              <p className="mt-3 text-sm leading-6 text-foreground">
                {insight.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="app-card overflow-hidden">
        <div className="app-card-header">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="section-title">Lead Attention</h2>
              <p className="mt-1 muted-copy">
                Potential booking opportunities that may need action.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                totalLeakageCount === 0
                  ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                  : "bg-amber-50 text-amber-800 ring-amber-200"
              }`}
            >
              {totalLeakageCount === 0
                ? "Nothing needs attention right now."
                : `${totalLeakageCount} need attention`}
            </span>
          </div>
        </div>
        {totalLeakageCount === 0 ? (
          <div className="p-5">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
              <p className="text-lg font-semibold text-emerald-950">
                All caught up.
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-800">
                Nice work. Your team is keeping new enquiries moving and there
                is nothing obvious waiting for action right now.
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full w-full rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid items-stretch gap-5 p-5 lg:grid-cols-2">
            <div className="flex min-w-0 flex-col justify-between gap-4">
              <div className="grid grid-cols-3 gap-3">
                {leakageMetrics.map((metric) => (
                  <div
                    className="min-w-0 rounded-xl border border-border bg-cyan-50/35 p-3"
                    key={metric.label}
                  >
                    <p className="text-2xl font-semibold text-foreground">
                      {metric.value}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-muted">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-full bg-slate-100">
                <div className="flex h-2">
                  {leakageMetrics.map((metric) => (
                    <div
                      className={metric.color}
                      key={metric.label}
                      style={{
                        width: `${(metric.value / totalLeakageCount) * 100}%`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0 rounded-xl border border-border bg-white">
              <div className="divide-y divide-border">
                {leakageRows.slice(0, 4).map(({ lead, reason }) => (
                  <Link
                    className="grid gap-2 px-4 py-3 transition hover:bg-cyan-50/50 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_112px] md:items-center"
                    href={`/dashboard/leads/${lead.id}`}
                    key={lead.id}
                  >
                    <p className="truncate text-sm font-medium text-foreground">
                      {formatLeadName(lead.full_name)}
                    </p>
                    <p className="min-w-0 truncate text-sm text-muted">
                      {reason}
                    </p>
                    <div className="justify-self-end">
                      <StatusBadge status={lead.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="app-card overflow-hidden">
        <div className="app-card-header flex items-center justify-between">
          <h2 className="section-title">Recent leads</h2>
          <Link
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
            href="/dashboard/leads"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {leads.slice(0, 5).map((lead) => (
            <Link
              className="grid gap-3 px-5 py-4 transition hover:bg-cyan-50/50 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_112px_112px] md:items-center"
              href={`/dashboard/leads/${lead.id}`}
              key={lead.id}
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {formatLeadName(lead.full_name)}
                </p>
                <p className="mt-1 truncate text-sm text-muted">
                  {lead.email ?? lead.phone ?? "No contact details"}
                </p>
              </div>
              <p className="min-w-0 truncate text-sm text-slate-700">
                {formatLabel(lead.service_requested)}
              </p>
              <div className="justify-self-start md:justify-self-start">
                <SourceBadge source={lead.source} />
              </div>
              <div className="justify-self-start md:justify-self-end md:text-right">
                <StatusBadge status={lead.status} />
              </div>
            </Link>
          ))}
          {leads.length === 0 ? (
            <p className="px-5 py-6 muted-copy">
              No leads yet. New enquiries will appear here as they are captured.
            </p>
          ) : null}
        </div>
      </section>

      <section className="app-card overflow-hidden">
        <div className="app-card-header flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="section-title">Treatment Demand</h2>
            <p className="mt-1 muted-copy">
              {treatmentDemand.countedLeadCount > 0
                ? topTreatmentTies > 1
                  ? `${treatmentDemand.countedLeadCount} service enquiries counted from ${treatmentDemand.recentLeadCount} recent leads. Multiple services are tied.`
                  : `${treatmentDemand.countedLeadCount} service enquiries counted from ${treatmentDemand.recentLeadCount} recent leads. Most requested: ${treatmentDemand.services[0].service}.`
                : "Not enough enquiry data yet."}
            </p>
            {treatmentDemand.unclassifiedCount > 0 ? (
              <p className="mt-1 text-xs text-muted">
                {treatmentDemand.unclassifiedCount} recent{" "}
                {treatmentDemand.unclassifiedCount === 1 ? "lead is" : "leads are"}{" "}
                missing a captured service.
              </p>
            ) : null}
          </div>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-accent ring-1 ring-cyan-200">
            Last 30 days
          </span>
        </div>
        <div className="space-y-4 p-5">
          {treatmentDemandRows.length > 0 ? (
            treatmentDemandRows.map((item) => {
              const isOtherServices = item.service === "Other services";
              const barWidth =
                totalTreatmentDemandCount > 0
                  ? (item.count / totalTreatmentDemandCount) * 100
                  : 0;

              return (
              <div
                className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(180px,0.7fr)_96px] md:items-center"
                key={item.service}
              >
                <p
                  className={`truncate text-sm font-medium ${
                    isOtherServices ? "text-muted" : "text-foreground"
                  }`}
                >
                  {item.service}
                </p>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      isOtherServices ? "bg-slate-300" : "bg-teal-500"
                    }`}
                    style={{
                      width: `${Math.max(4, barWidth)}%`
                    }}
                  />
                </div>
                <p className="text-sm text-muted md:text-right">
                  {item.count} {item.count === 1 ? "enquiry" : "enquiries"}
                </p>
              </div>
              );
            })
          ) : (
            <p className="muted-copy">
              Service demand will appear here once more enquiries include a
              captured treatment or service.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
