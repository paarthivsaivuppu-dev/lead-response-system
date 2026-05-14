import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { LogoutButton } from "@/components/auth/logout-button";
import { SubmitButton } from "@/components/ui/submit-button";
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
    <div className="space-y-7">
      <section>
        <p className="page-kicker">{business.name}</p>
        <h1 className="page-title">Settings</h1>
      </section>

      {saved === "1" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Settings saved.
        </div>
      ) : null}

      <form
        action={updateBusinessSettings}
        className="space-y-5"
      >
        <section className="app-card overflow-hidden">
          <div className="app-card-header">
            <h2 className="section-title">Business details</h2>
          </div>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <div>
              <label className="app-label" htmlFor="business_name">
                Business name
              </label>
              <input
                className="app-input"
                defaultValue={business.name}
                id="business_name"
                name="business_name"
                required
                type="text"
              />
            </div>

            <div>
              <label className="app-label" htmlFor="reply_tone">
                Reply tone
              </label>
              <input
                className="app-input"
                defaultValue={business.reply_tone ?? "Friendly and professional"}
                id="reply_tone"
                name="reply_tone"
                placeholder="Friendly and professional"
                type="text"
              />
            </div>
          </div>
        </section>

        <section className="app-card overflow-hidden">
          <div className="app-card-header">
            <h2 className="section-title">Notification settings</h2>
          </div>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <div>
              <label className="app-label" htmlFor="notification_email">
                Notification email
              </label>
              <input
                className="app-input"
                defaultValue={business.notification_email ?? ""}
                id="notification_email"
                name="notification_email"
                placeholder="owner@example.com"
                type="email"
              />
            </div>

            <div>
              <label className="app-label" htmlFor="notification_phone">
                Notification phone
              </label>
              <input
                className="app-input"
                defaultValue={business.notification_phone ?? ""}
                id="notification_phone"
                name="notification_phone"
                placeholder="0424 718 402"
                type="tel"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-start gap-3 rounded-xl border border-border bg-cyan-50/45 p-4">
                <input
                  className="mt-1 h-4 w-4 rounded border-border accent-[#007c95]"
                  defaultChecked={settings.email_notifications_enabled}
                  name="email_notifications_enabled"
                  type="checkbox"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    Send email notifications for new leads
                  </span>
                  <span className="mt-1 block muted-copy">
                    When enabled, the business notification email receives an
                    alert when any new lead is created.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </section>

        <section className="app-card overflow-hidden">
          <div className="app-card-header">
            <h2 className="section-title">SMS safety/settings</h2>
          </div>
          <div className="p-6">
            <label className="flex items-start gap-3 rounded-xl border border-border bg-cyan-50/45 p-4">
              <input
                className="mt-1 h-4 w-4 rounded border-border accent-[#007c95]"
                defaultChecked={settings.sms_alerts_enabled}
                name="sms_alerts_enabled"
                type="checkbox"
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Send SMS alerts for new leads
                </span>
                <span className="mt-1 block muted-copy">
                  When enabled, the business notification phone receives an SMS
                  alert when any new lead is created.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="app-card overflow-hidden">
          <div className="app-card-header">
            <h2 className="section-title">Inbound email setup</h2>
          </div>
          <div className="p-6">
            <label className="app-label" htmlFor="inbound_email_alias">
              Inbound email alias
            </label>
            <input
              className="app-input"
              defaultValue={business.inbound_email_alias ?? ""}
              id="inbound_email_alias"
              name="inbound_email_alias"
              placeholder="northside"
              type="text"
            />
            <p className="mt-3 muted-copy">
              Client setup: forward enquiry emails to the assigned inbound
              address. Resend receives those emails and sends them to this app's
              webhook.
            </p>
          </div>
        </section>

        <div className="app-card flex justify-end px-6 py-4">
          <SubmitButton pendingText="Saving...">Save settings</SubmitButton>
        </div>
      </form>

      <section className="app-card overflow-hidden">
        <div className="app-card-header">
          <h2 className="section-title">Account</h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm font-medium text-foreground">Sign out</p>
            <p className="mt-1 muted-copy">
              Log out of this ClinicResponse AI account on this device.
            </p>
          </div>
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
