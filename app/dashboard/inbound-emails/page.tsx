import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { InboundEmailLogsTable } from "@/components/inbound-emails/inbound-email-logs-table";
import { getInboundEmailLogsForCurrentBusiness } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function InboundEmailsPage() {
  const { business, logs } = await getInboundEmailLogsForCurrentBusiness();

  if (!business) {
    return <EmptyBusiness />;
  }

  return (
    <div className="space-y-7">
      <section>
        <p className="page-kicker">{business.name}</p>
        <h1 className="page-title">Inbound Emails</h1>
      </section>

      <section className="app-card overflow-hidden">
        <InboundEmailLogsTable logs={logs} />
      </section>
    </div>
  );
}
