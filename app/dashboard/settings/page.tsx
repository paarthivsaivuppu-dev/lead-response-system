import { headers } from "next/headers";
import { EmptyBusiness } from "@/components/dashboard/empty-business";
import { LogoutButton } from "@/components/auth/logout-button";
import { CopyButton } from "@/components/settings/copy-button";
import { SettingsSaveNotice } from "@/components/settings/settings-save-notice";
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
  const headerStore = await headers();
  const business = await getCurrentBusiness();

  if (!business) {
    return <EmptyBusiness />;
  }

  const settings = await getBusinessSettings(business.id);
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const appOrigin =
    process.env.NEXT_PUBLIC_APP_URL ?? (host ? `${protocol}://${host}` : "");
  const publicFormPath = `/lead-form/${business.id}`;
  const publicFormUrl = appOrigin
    ? `${appOrigin}${publicFormPath}`
    : publicFormPath;
  const inboundDomain = process.env.RESEND_INBOUND_DOMAIN?.trim();
  const inboundAlias = business.inbound_email_alias?.trim() || null;
  const inboundAddress =
    inboundAlias && inboundDomain ? `${inboundAlias}@${inboundDomain}` : null;
  const embedCode = `<iframe src="${publicFormUrl}" width="100%" height="700" style="border:0;"></iframe>`;

  return (
    <div className="space-y-7">
      <section>
        <p className="page-kicker safe-text">{business.name}</p>
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
              <p className="app-label">
                Reply tone
              </p>
              <input
                name="reply_tone"
                type="hidden"
                value={business.reply_tone ?? "Friendly and professional"}
              />
              <div className="safe-text mt-2 rounded-lg border border-border bg-slate-50 px-3 py-2.5 text-sm text-muted">
                {business.reply_tone ?? "Friendly and professional"}
              </div>
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

        <SettingsSaveNotice />
      </form>

      <section className="app-card overflow-hidden">
        <div className="app-card-header">
          <h2 className="section-title">Website enquiry capture</h2>
        </div>
        <div className="grid gap-4 p-6">
          <div className="rounded-2xl border border-border bg-cyan-50/40 p-5">
            <p className="text-sm font-semibold text-foreground">
              Option A — Use your existing website form
            </p>
            <p className="mt-2 muted-copy">
              If your website already sends enquiry emails, forward those form
              notification emails to your inbound email address so they appear in
              ClinicResponse.
            </p>
            <div className="mt-4 rounded-xl border border-cyan-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Inbound email
              </p>
              {inboundAddress ? (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <code className="safe-text rounded-lg bg-slate-50 px-3 py-2 text-sm text-foreground">
                    {inboundAddress}
                  </code>
                  <CopyButton value={inboundAddress} />
                </div>
              ) : inboundAlias ? (
                <div className="mt-2 space-y-2">
                  <code className="safe-text inline-flex rounded-lg bg-slate-50 px-3 py-2 text-sm text-foreground">
                    Alias: {inboundAlias}
                  </code>
                  <p className="muted-copy">
                    The full inbound address is configured during setup.
                  </p>
                </div>
              ) : (
                <p className="mt-2 muted-copy">
                  Set an inbound email alias above to enable email forwarding.
                </p>
              )}
              <p className="mt-3 muted-copy">
                Best when the clinic already has a working contact or enquiry
                form on their website.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="text-sm font-semibold text-foreground">
              Option B — Use the hosted ClinicResponse form
            </p>
            <p className="mt-2 muted-copy">
              If you do not have a form yet, or want a fast pilot setup, use
              this hosted enquiry form link.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-slate-50 p-4">
              <code className="min-w-0 flex-1 break-all text-sm text-foreground">
                {publicFormUrl}
              </code>
              <CopyButton value={publicFormUrl} />
              <a
                className="inline-flex min-h-9 items-center justify-center rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent-dark"
                href={publicFormUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open form
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="text-sm font-semibold text-foreground">
              Option C — Embed the ClinicResponse form
            </p>
            <p className="mt-2 muted-copy">
              Embed this form on your website if you want customers to stay on
              your site while enquiries still flow into ClinicResponse.
            </p>
            <div className="mt-4 rounded-xl border border-border bg-slate-50 p-4">
              <pre className="safe-pre text-sm leading-6 text-slate-700">
                {embedCode}
              </pre>
              <div className="mt-3">
                <CopyButton label="Copy embed code" value={embedCode} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="app-card overflow-hidden">
        <div className="app-card-header">
          <h2 className="section-title">Account</h2>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="min-w-0">
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
