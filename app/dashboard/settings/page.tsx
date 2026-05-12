import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { Button } from "@/components/ui/button";
import { updateBusinessSettings } from "@/app/dashboard/settings/actions";
import { getBusinessSettings, getCurrentBusiness } from "@/lib/data";

export const dynamic = "force-dynamic";

type SettingsPageProps = {
  searchParams: Promise<{
    saved?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { saved } = await searchParams;
  const business = await getCurrentBusiness();

  if (!business) {
    return <EmptyBusiness />;
  }

  const settings = await getBusinessSettings(business.id);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-muted">{business.name}</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-950">Settings</h1>
      </section>

      {saved === "1" ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Settings saved.
        </div>
      ) : null}

      <form
        action={updateBusinessSettings}
        className="rounded-lg border border-border bg-white shadow-soft"
      >
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Business details
          </h2>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="business_name"
            >
              Business name
            </label>
            <input
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
              defaultValue={business.name}
              id="business_name"
              name="business_name"
              required
              type="text"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="notification_email"
            >
              Notification email
            </label>
            <input
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
              defaultValue={business.notification_email ?? ""}
              id="notification_email"
              name="notification_email"
              placeholder="owner@example.com"
              type="email"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="notification_phone"
            >
              Notification phone
            </label>
            <input
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
              defaultValue={business.notification_phone ?? ""}
              id="notification_phone"
              name="notification_phone"
              placeholder="+61 400 000 000"
              type="tel"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="reply_tone"
            >
              Reply tone
            </label>
            <input
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
              defaultValue={business.reply_tone ?? "Friendly and professional"}
              id="reply_tone"
              name="reply_tone"
              placeholder="Friendly and professional"
              type="text"
            />
          </div>

          <div className="md:col-span-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="inbound_email_alias"
            >
              Inbound email alias
            </label>
            <input
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none ring-slate-900/10 focus:ring-4"
              defaultValue={business.inbound_email_alias ?? ""}
              id="inbound_email_alias"
              name="inbound_email_alias"
              placeholder="northside"
              type="text"
            />
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Client setup: forward enquiry emails to the assigned inbound
              address. Resend receives those emails and sends them to this app's
              webhook.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-start gap-3 rounded-md border border-border bg-slate-50 p-4">
              <input
                className="mt-1 h-4 w-4 rounded border-border"
                defaultChecked={settings.email_notifications_enabled}
                name="email_notifications_enabled"
                type="checkbox"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">
                  Send email notifications for new leads
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  When enabled, the business notification email receives an
                  alert when any new lead is created.
                </span>
              </span>
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-start gap-3 rounded-md border border-border bg-slate-50 p-4">
              <input
                className="mt-1 h-4 w-4 rounded border-border"
                defaultChecked={settings.sms_alerts_enabled}
                name="sms_alerts_enabled"
                type="checkbox"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">
                  Send SMS alerts for new leads
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  When enabled, the business notification phone receives an SMS
                  alert when any new lead is created.
                </span>
              </span>
            </label>
          </div>
        </div>
        <div className="flex justify-end border-t border-border px-6 py-4">
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </div>
  );
}
