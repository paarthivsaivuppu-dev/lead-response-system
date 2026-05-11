import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, LayoutDashboard, Settings } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link className="text-base font-semibold text-slate-950" href="/dashboard">
            Lead Response
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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
      {smsConfig.customerSmsTestMode ? (
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center text-sm font-medium text-amber-900">
          Customer SMS Test Mode is ON — customer replies are being sent to the
          test phone number.
        </div>
      ) : null}
      {!smsConfig.businessSmsAlertsEnabled ? (
        <div className="border-b border-slate-200 bg-slate-100 px-6 py-2 text-center text-sm font-medium text-slate-700">
          Business SMS alerts are OFF.
        </div>
      ) : null}
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
