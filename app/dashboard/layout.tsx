import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, LayoutDashboard, Settings } from "lucide-react";
import { DashboardStatusNotices } from "@/components/dashboard/status-notices";
import { getBusinessSettings, getCurrentBusiness } from "@/lib/data";
import { getSmsSafetyConfig } from "@/lib/sms/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/leads", label: "Leads", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const smsConfig = getSmsSafetyConfig();
  const business = await getCurrentBusiness();
  const businessSettings = business
    ? await getBusinessSettings(business.id)
    : null;
  const showCustomerSmsTestNotice =
    smsConfig.customerSmsAutoReplyEnabled && smsConfig.customerSmsTestMode;
  const showBusinessSmsOffNotice =
    Boolean(business) &&
    (!smsConfig.businessSmsAlertsEnabled ||
      businessSettings?.sms_alerts_enabled !== true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            className="inline-flex items-center gap-2 text-base font-semibold text-foreground"
            href="/dashboard"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-white shadow-sm">
              L
            </span>
            LeadResponse AI
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-cyan-50 hover:text-accent"
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <DashboardStatusNotices
          showBusinessSmsOffNotice={showBusinessSmsOffNotice}
          showCustomerSmsTestNotice={showCustomerSmsTestNotice}
        />
        {children}
      </main>
    </div>
  );
}
